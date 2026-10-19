"""Extract real structural data for the CMTMC visuals.

Outputs JSON files consumed by studio.html:
  kinase.json   c-Src kinase (PDB 2SRC): CA trace, dot surface, pocket residues, ANP ligand
  enzyme.json   ferritin-like oxidoreductase (PDB 4Y08): CA trace, dot surface, Fe sites
  mols.json     RDKit 3D conformers + 2D layouts of real phytochemicals
"""
import json, math, sys
import numpy as np
from scipy.spatial import cKDTree
from rdkit import Chem
from rdkit.Chem import AllChem

D = sys.argv[1]
VDW = {'C': 1.7, 'N': 1.55, 'O': 1.52, 'S': 1.8, 'P': 1.8, 'FE': 1.4}


def parse(path):
    atoms = []
    for ln in open(path):
        if ln.startswith(('ATOM', 'HETATM')):
            alt = ln[16]
            if alt not in ' A':
                continue
            el = (ln[76:78].strip() or ln[12:14].strip()).upper()
            atoms.append(dict(rec=ln[:6].strip(), name=ln[12:16].strip(), res=ln[17:20].strip(),
                              chain=ln[21], resi=int(ln[22:26]), el=el,
                              xyz=[float(ln[30:38]), float(ln[38:46]), float(ln[46:54])],
                              occ=float(ln[54:60] or 1)))
    return atoms


def sphere_pts(n):
    i = np.arange(n) + 0.5
    phi = np.arccos(1 - 2 * i / n)
    th = math.pi * (1 + 5 ** 0.5) * i
    return np.stack([np.cos(th) * np.sin(phi), np.sin(th) * np.sin(phi), np.cos(phi)], 1)


def dot_surface(xyz, els, probe=0.6, n=40, keep_every=1):
    rad = np.array([VDW.get(e, 1.7) + probe for e in els])
    tree = cKDTree(xyz)
    sp = sphere_pts(n)
    out = []
    for i, (c, r) in enumerate(zip(xyz, rad)):
        pts = c + sp * r
        nb = tree.query_ball_point(c, r + rad.max())
        nb = [j for j in nb if j != i]
        if nb:
            d = np.linalg.norm(pts[:, None, :] - xyz[nb][None], axis=2)
            pts = pts[(d >= rad[nb][None] - 1e-6).all(1)]
        out.append(pts)
    pts = np.concatenate(out)
    return pts[::keep_every]


def protein(path, chain='A'):
    atoms = [a for a in parse(path) if a['chain'] == chain]
    prot = [a for a in atoms if a['rec'] == 'ATOM']
    xyz = np.array([a['xyz'] for a in prot])
    ca = [a for a in prot if a['name'] == 'CA']
    return atoms, prot, xyz, ca


def r3(a):
    return [round(float(v), 2) for v in a]



def cartoon(path, prot, center, chain='A'):
    """Per-residue CA, carbonyl direction and secondary structure (from HELIX/SHEET records)."""
    ss = {}
    for ln in open(path):
        if ln.startswith('HELIX') and ln[19] == chain:
            for r in range(int(ln[21:25]), int(ln[33:37]) + 1): ss[r] = 'H'
        if ln.startswith('SHEET') and ln[21] == chain:
            for r in range(int(ln[22:26]), int(ln[33:37]) + 1): ss[r] = 'E'
    by = {}
    for a in prot:
        by.setdefault(a['resi'], {})[a['name']] = np.array(a['xyz'])
    out = []
    for r in sorted(by):
        d = by[r]
        if 'CA' not in d or 'O' not in d or 'C' not in d: continue
        o = d['O'] - d['C']; o /= np.linalg.norm(o)
        out.append(dict(r=r, ca=r3(d['CA'] - center), o=r3(o), ss=ss.get(r, 'C')))
    return out

# ---------- kinase ----------
atoms, prot, xyz, ca = protein(f'{D}/2src.pdb')
lig = [a for a in atoms if a['res'] == 'ANP']
lxyz = np.array([a['xyz'] for a in lig])
center = xyz.mean(0)
pocket_c = lxyz.mean(0)
surf = dot_surface(xyz, [a['el'] for a in prot], n=56, keep_every=1)
# residues with any atom within 4.5 A of the ligand
tree = cKDTree(lxyz)
near = sorted({(a['resi']) for a in prot if tree.query(a['xyz'])[0] < 4.5})
pocket_atoms = [a for a in prot if a['resi'] in near]
# simple bond perception for pocket residues + ligand
def bonds(alist, cut=1.9):
    p = np.array([a['xyz'] for a in alist])
    t = cKDTree(p)
    return [[i, j] for i, j in t.query_pairs(cut) if not (alist[i]['el'] == 'H' or alist[j]['el'] == 'H')]
# H-bond-like contacts: ligand N/O to protein N/O within 3.3 A
hb = []
pt = cKDTree(np.array([a['xyz'] for a in prot]))
for i, a in enumerate(lig):
    if a['el'] in 'NO':
        for j in pt.query_ball_point(a['xyz'], 3.3):
            if prot[j]['el'] in 'NO':
                hb.append([r3(np.array(a['xyz']) - center), r3(np.array(prot[j]['xyz']) - center)])
kin = dict(
    center=r3(center), pocket=r3(pocket_c - center),
    ca=[r3(np.array(a['xyz']) - center) for a in ca],
    res=cartoon(f'{D}/2src.pdb', prot, center),
    surf=np.round(surf - center, 1).flatten().tolist(),
    pocketAtoms=[dict(el=a['el'], p=r3(np.array(a['xyz']) - center)) for a in pocket_atoms],
    pocketBonds=bonds(pocket_atoms),
    lig=[dict(el=a['el'], p=r3(np.array(a['xyz']) - center)) for a in lig],
    ligBonds=bonds(lig),
    hbonds=hb,
)
json.dump(kin, open(f'{D}/kinase.json', 'w'))
print('kinase', len(ca), 'CA', len(surf), 'dots', len(near), 'pocket res', len(hb), 'hb')

# ---------- enzyme ----------
atoms, prot, xyz, ca = protein(f'{D}/4Y08.pdb')
center = xyz.mean(0)
fe = [a for a in atoms if a['res'] == 'FE2' and a['occ'] >= 0.5]
surf = dot_surface(xyz, [a['el'] for a in prot], keep_every=2)
enz = dict(ca=[r3(np.array(a['xyz']) - center) for a in ca], res=cartoon(f'{D}/4Y08.pdb', prot, center),
           surf=np.round(surf - center, 1).flatten().tolist(),
           fe=[r3(np.array(a['xyz']) - center) for a in fe])
json.dump(enz, open(f'{D}/enzyme.json', 'w'))
print('enzyme', len(ca), 'CA', len(surf), 'dots', len(fe), 'Fe')

# ---------- phytochemicals ----------
SMI = {
    'quercetin': 'O=C1C(O)=C(Oc2cc(O)cc(O)c12)c1ccc(O)c(O)c1',
    'curcumin': 'COc1cc(/C=C/C(=O)CC(=O)/C=C/c2ccc(O)c(OC)c2)ccc1O',
    'berberine': 'COc1ccc2cc3[n+](cc2c1OC)CCc1cc2OCOc2cc1-3',
    'artemisinin': 'C[C@@H]1CC[C@H]2[C@@H](C)C(=O)O[C@@H]3O[C@@]4(C)CC[C@@H]1[C@]32OO4',
    'withaferinA': 'CC1=C(C)C(=O)O[C@H](C1)[C@@H](C)[C@H]1CC[C@H]2[C@@H]3C[C@H]4O[C@@]45[C@@H](O)C=CC(=O)[C@]5(C)[C@H]3CC[C@]12C',
    'piperine': 'O=C(/C=C/C=C/c1ccc2OCOc2c1)N1CCCCC1',
}
mols = {}
for name, smi in SMI.items():
    m = Chem.AddHs(Chem.MolFromSmiles(smi))
    AllChem.EmbedMolecule(m, randomSeed=7)
    AllChem.MMFFOptimizeMolecule(m)
    m = Chem.RemoveHs(m)
    conf = m.GetConformer()
    p = np.array([list(conf.GetAtomPosition(i)) for i in range(m.GetNumAtoms())])
    p -= p.mean(0)
    m2 = Chem.Mol(m)
    AllChem.Compute2DCoords(m2)
    c2 = m2.GetConformer()
    q = np.array([list(c2.GetAtomPosition(i))[:2] for i in range(m2.GetNumAtoms())])
    q -= q.mean(0)
    mols[name] = dict(
        el=[a.GetSymbol() for a in m.GetAtoms()],
        p=[r3(v) for v in p], p2=[r3(v) for v in q],
        b=[[b.GetBeginAtomIdx(), b.GetEndAtomIdx(), b.GetBondTypeAsDouble()] for b in m.GetBonds()],
        arom=[a.GetIsAromatic() for a in m.GetAtoms()],
    )
json.dump(mols, open(f'{D}/mols.json', 'w'))
print('mols', {k: len(v['el']) for k, v in mols.items()})
