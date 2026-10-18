import { useEffect, useRef } from 'react';

/*
 * The home-page specimen: a leaf drawn as a graph. Veins are edges, junctions are nodes,
 * and saffron signals travel from the stalk to the vein tips the way messages pass through
 * a graph neural network. Some vein tips end in a six-membered ring: the molecules the
 * plant makes.
 */
const COLORS = { vein: 'rgba(233,239,228,', saffron: '#E8A33D', ring: 'rgba(233,239,228,0.85)' };

function quad(a, c, b, n = 16) {
  const pts = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n, u = 1 - t;
    pts.push({ x: u * u * a.x + 2 * u * t * c.x + t * t * b.x, y: u * u * a.y + 2 * u * t * c.y + t * t * b.y });
  }
  return pts;
}

function buildLeaf(w, h) {
  const narrow = w < 560;
  const base = narrow ? { x: w * 0.12, y: h * 0.9 } : { x: w * 0.14, y: h * 0.88 };
  const tip = narrow ? { x: w * 0.9, y: h * 0.1 } : { x: w * 0.9, y: h * 0.1 };
  const dx = tip.x - base.x, dy = tip.y - base.y, L = Math.hypot(dx, dy);
  const ux = dx / L, uy = dy / L, nx = -uy, ny = ux;
  const maxW = L * 0.29;
  const P = (t, s) => {
    const tt = Math.max(0, Math.min(1, t));
    const half = maxW * Math.pow(Math.sin(Math.PI * tt), 0.8) * (1 - 0.22 * tt);
    const bend = Math.sin(Math.PI * tt) * L * 0.045;
    return { x: base.x + ux * L * t + nx * (s * half + bend), y: base.y + uy * L * t + ny * (s * half + bend) };
  };

  const outline = [];
  for (let i = 0; i <= 60; i++) outline.push(P(i / 60, 1));
  for (let i = 60; i >= 0; i--) outline.push(P(i / 60, -1));

  const edges = [], rings = [], nodes = [];
  const edge = (pts, parent, width, ring) => {
    const e = { pts, kids: [], width, ring, glow: 0 };
    if (parent) parent.kids.push(e);
    edges.push(e);
    return e;
  };

  const stalkStart = { x: base.x - ux * L * 0.1, y: base.y - uy * L * 0.1 };
  let prev = edge(quad(stalkStart, { x: (stalkStart.x + base.x) / 2 + nx * 6, y: (stalkStart.y + base.y) / 2 + ny * 6 }, base, 6), null, 3);
  const root = prev;
  const joints = [0.1, 0.19, 0.28, 0.37, 0.46, 0.55, 0.64, 0.73, 0.82];
  let lastT = 0;
  joints.forEach((t, k) => {
    const seg = [];
    for (let i = 0; i <= 8; i++) seg.push(P(lastT + (t - lastT) * (i / 8), 0));
    prev = edge(seg, prev, 2.4);
    nodes.push(P(t, 0));
    [1, -1].forEach((side) => {
      const end = P(t + 0.12, side * 0.86);
      const ctrl = P(t + 0.025, side * 0.48);
      const ringHere = (k + (side > 0 ? 0 : 1)) % 3 === 0;
      const sec = edge(quad(P(t, 0), ctrl, end), prev, 1.3, ringHere ? rings.length : undefined);
      if (ringHere) rings.push({ x: end.x, y: end.y, r: Math.max(6, L * 0.013), glow: 0, rot: Math.random() * Math.PI });
      else nodes.push(end);
      // a smaller vein leaving the middle of each secondary vein
      const mid = sec.pts[8];
      const tEnd = P(t + 0.07, side * 0.72);
      edge(quad(mid, { x: (mid.x + tEnd.x) / 2 - nx * side * 4, y: (mid.y + tEnd.y) / 2 - ny * side * 4 }, tEnd, 8), sec, 0.8);
      nodes.push(tEnd);
    });
    lastT = t;
  });
  const top = []; for (let i = 0; i <= 8; i++) top.push(P(lastT + (1 - lastT) * (i / 8), 0));
  edge(top, prev, 1.6);
  return { outline, edges, rings, nodes, root };
}

export default function LeafCanvas() {
  const ref = useRef(null);

  useEffect(() => {
    const cv = ref.current;
    const ctx = cv.getContext('2d');
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let leaf, pulses = [], frame = 0, raf = 0, visible = true, W = 0, H = 0;

    const resize = () => {
      const r = cv.getBoundingClientRect();
      if (!r.width) return;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      W = r.width; H = r.height;
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      leaf = buildLeaf(W, H);
      pulses = [];
      draw();
    };

    const spawn = () => pulses.push({ e: leaf.root, i: 0, v: 0.35 + Math.random() * 0.25 });

    function draw() {
      if (!leaf) return;
      ctx.clearRect(0, 0, W, H);
      // blade
      ctx.beginPath();
      leaf.outline.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
      ctx.closePath();
      ctx.fillStyle = 'rgba(233,239,228,0.05)'; ctx.fill();
      ctx.strokeStyle = 'rgba(233,239,228,0.55)'; ctx.lineWidth = 1.4; ctx.stroke();
      // veins
      ctx.lineCap = 'round';
      for (const e of leaf.edges) {
        ctx.beginPath();
        e.pts.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
        ctx.strokeStyle = COLORS.vein + (0.35 + 0.4 * Math.min(1, e.width / 2.4) + e.glow * 0.4) + ')';
        ctx.lineWidth = e.width;
        ctx.stroke();
      }
      // junction nodes
      ctx.fillStyle = 'rgba(233,239,228,0.9)';
      for (const n of leaf.nodes) { ctx.beginPath(); ctx.arc(n.x, n.y, 2.2, 0, Math.PI * 2); ctx.fill(); }
      // rings (molecules)
      for (const r of leaf.rings) {
        ctx.beginPath();
        for (let k = 0; k <= 6; k++) {
          const a = r.rot + (k * Math.PI) / 3;
          const x = r.x + r.r * Math.cos(a), y = r.y + r.r * Math.sin(a);
          k ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
        }
        ctx.strokeStyle = r.glow > 0.05 ? COLORS.saffron : COLORS.ring;
        ctx.lineWidth = 1.5; ctx.stroke();
        if (r.glow > 0.05) { ctx.globalAlpha = r.glow * 0.35; ctx.fillStyle = COLORS.saffron; ctx.fill(); ctx.globalAlpha = 1; }
      }
      // signals
      ctx.fillStyle = COLORS.saffron;
      for (const p of pulses) {
        const pts = p.e.pts, i = Math.min(pts.length - 1, Math.floor(p.i)), j = Math.min(pts.length - 1, i + 1), f = p.i - i;
        const x = pts[i].x + (pts[j].x - pts[i].x) * f, y = pts[i].y + (pts[j].y - pts[i].y) * f;
        ctx.beginPath(); ctx.arc(x, y, p.e.width > 2 ? 3.6 : 2.8, 0, Math.PI * 2); ctx.fill();
      }
    }

    function step() {
      frame++;
      if (frame % 9 === 0 && pulses.length < 40) spawn();
      const next = [];
      for (const p of pulses) {
        p.i += p.v;
        p.e.glow = Math.min(1, p.e.glow + 0.05);
        if (p.i >= p.e.pts.length - 1) {
          if (p.e.ring !== undefined) leaf.rings[p.e.ring].glow = 1;
          const kids = p.e.kids;
          if (kids.length) {
            // a signal continues along the midrib or turns into a side vein
            const k = kids[Math.floor(Math.random() * kids.length)];
            next.push({ e: k, i: 0, v: p.v });
            if (kids.length > 1 && Math.random() < 0.35) next.push({ e: kids[(kids.indexOf(k) + 1) % kids.length], i: 0, v: p.v });
          }
        } else next.push(p);
      }
      pulses = next.slice(0, 60);
      for (const e of leaf.edges) e.glow *= 0.96;
      for (const r of leaf.rings) r.glow *= 0.97;
      draw();
      raf = visible ? requestAnimationFrame(step) : 0;
    }

    resize();
    const ro = new ResizeObserver(resize); ro.observe(cv);
    let io;
    if (!reduce) {
      raf = requestAnimationFrame(step);
      io = new IntersectionObserver(([en]) => {
        visible = en.isIntersecting;
        if (visible && !raf) raf = requestAnimationFrame(step);
      });
      io.observe(cv);
    }
    return () => { cancelAnimationFrame(raf); ro.disconnect(); io?.disconnect(); };
  }, []);

  return <canvas ref={ref} className="leaf" role="img" aria-label="Illustration of a leaf whose veins form a network, with signals travelling from the stalk to molecule rings at the vein tips" />;
}
