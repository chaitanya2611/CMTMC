# Scientific visuals

Every image and video in `client/public/media/` is rendered from real structural data with
the scripts in this folder. Nothing is stock imagery.

| File | What it shows | Data |
|---|---|---|
| `hero.*` | c-Src kinase cartoon with dot molecular surface; quercetin settles into the ATP-binding pocket; background data network and drifting phytochemicals | PDB 2SRC; RDKit conformers |
| `theme-kg.*` | Leaf venation feeding a plants → compounds → targets → conditions network | procedural |
| `theme-ai.*` | Message passing over the molecular graph of quercetin, with a learned-embedding point cloud | RDKit 2D layout |
| `theme-cat.*` | CO hopping fcc → bridge → hcp on an fcc(111) slab (Pt nearest-neighbour 2.77 Å) with an illustrative energy profile | lattice geometry |
| `theme-enz.*` | Ferritin-like oxidoreductase with its iron site, approached by piperine | PDB 4Y08 |
| `wf-*.webp` | Workflow tiles: leaf, curcumin, c-Src pocket close-up, embedding, c-Src, cell field | as above |

The quercetin pose in the kinase is an illustration (aligned onto the crystallographic ATP
analogue by principal axes), not a docking result.

## Rebuild

```bash
mkdir data && for f in 2src 4Y08; do curl -sfo data/$f.pdb https://raw.githubusercontent.com/nglviewer/ngl/master/data/$f.pdb; done
pip install rdkit scipy numpy && python3 prep.py data
npm i three@0.160.0
node capture.mjs hero 1920 1080 24 frames/hero/f --fps 24          # Playwright + Chromium
./encode.sh frames/hero ../../client/public/media/hero 1600 42 29  # WebM (VP9) + MP4 (H.264)
node capture.mjs kg 960 640 10 frames/kg/f --fps 24 && ./encode.sh frames/kg ../../client/public/media/theme-kg 720 38 27
node capture.mjs leaf 800 600 10 stills/leaf --stills 3             # workflow stills
```

Scenes: `hero kg gnn cat enz` (loops) and `leaf chem dock gnn target cells` (stills).
All motion is periodic in the loop length, so the videos loop seamlessly.
