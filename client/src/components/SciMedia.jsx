import { useEffect, useRef, useState, useSyncExternalStore } from 'react';

/*
 * Scientific background media. Every visual was rendered from real structural data
 * (PDB entries, RDKit conformers) — see client/public/media/README.md.
 *
 * Videos only play when motion is appropriate: not on small screens, not with
 * prefers-reduced-motion or Save-Data, and not after the visitor pauses motion.
 * Otherwise the static poster frame is shown.
 */

const M = '/media';

// ---- visitor's "pause motion" choice (shared by all videos, remembered per browser) ----
const KEY = 'cmtmc-motion-paused';
let paused = (() => { try { return localStorage.getItem(KEY) === '1'; } catch { return false; } })();
const subs = new Set();
export function setMotionPaused(v) {
  paused = v;
  try { localStorage.setItem(KEY, v ? '1' : '0'); } catch { /* storage unavailable */ }
  subs.forEach((f) => f());
}
const usePaused = () => useSyncExternalStore((f) => { subs.add(f); return () => subs.delete(f); }, () => paused, () => paused);

function query(q) { return typeof window !== 'undefined' && window.matchMedia ? window.matchMedia(q) : null; }
function useMedia(q) {
  const [match, setMatch] = useState(() => Boolean(query(q)?.matches));
  useEffect(() => {
    const m = query(q); if (!m) return undefined;
    const on = () => setMatch(m.matches); on();
    m.addEventListener?.('change', on); return () => m.removeEventListener?.('change', on);
  }, [q]);
  return match;
}

/** True when autoplaying video is appropriate for this visitor and device. */
export function useMotionOK() {
  const reduced = useMedia('(prefers-reduced-motion: reduce)');
  const small = useMedia('(max-width: 760px)');
  const userPaused = usePaused();
  const saveData = typeof navigator !== 'undefined' && navigator.connection?.saveData;
  return !reduced && !small && !saveData && !userPaused;
}

// Plays only while on screen; the source is attached lazily the first time it is visible.
function useOnScreen(ref, margin = '200px') {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el || !('IntersectionObserver' in window)) { setOn(true); return undefined; }
    const io = new IntersectionObserver(([e]) => setOn(e.isIntersecting), { rootMargin: margin });
    io.observe(el); return () => io.disconnect();
  }, [ref, margin]);
  return on;
}

function LoopVideo({ name, poster, onScreen, ok, eager = false }) {
  const v = useRef(null);
  const [attached, setAttached] = useState(false);
  const [playing, setPlaying] = useState(false);
  useEffect(() => { if (ok && (onScreen || eager)) setAttached(true); }, [ok, onScreen, eager]);
  useEffect(() => {
    const el = v.current; if (!el) return;
    if (ok && onScreen && !document.hidden) { const p = el.play(); if (p?.catch) p.catch(() => {}); } else el.pause();
  }, [ok, onScreen, attached]);
  useEffect(() => {
    const vis = () => { const el = v.current; if (!el) return; if (document.hidden) el.pause(); else if (ok && onScreen) el.play().catch(() => {}); };
    document.addEventListener('visibilitychange', vis); return () => document.removeEventListener('visibilitychange', vis);
  }, [ok, onScreen]);
  if (!attached) return null;
  return (
    <video ref={v} className={`sci__video${playing ? ' is-playing' : ''}`} muted loop playsInline preload="auto" poster={poster}
      aria-hidden="true" tabIndex={-1} onPlaying={() => setPlaying(true)}>
      <source src={`${M}/${name}.webm`} type="video/webm" />
      <source src={`${M}/${name}.mp4`} type="video/mp4" />
    </video>
  );
}

// ---------- hero ----------
export const HERO_CREDIT = 'Illustration: c-Src kinase (PDB 2SRC) with quercetin settling into the ATP-binding pocket';

export function HeroMedia() {
  const ref = useRef(null);
  const ok = useMotionOK();
  const onScreen = useOnScreen(ref, '0px');
  // wait until the page has loaded so the video never competes with first paint
  const [loaded, setLoaded] = useState(() => typeof document !== 'undefined' && document.readyState === 'complete');
  useEffect(() => {
    if (loaded) return undefined;
    const on = () => setLoaded(true); window.addEventListener('load', on); return () => window.removeEventListener('load', on);
  }, [loaded]);
  return (
    <div className="hero__media sci" ref={ref} aria-hidden="true">
      <picture>
        <source media="(max-width: 760px)" srcSet={`${M}/hero-still-m.webp`} type="image/webp" />
        <source srcSet={`${M}/hero-poster.webp`} type="image/webp" />
        <img className="sci__poster" src={`${M}/hero-poster.jpg`} alt="" fetchpriority="high" decoding="async" />
      </picture>
      {loaded && <LoopVideo name="hero" poster={`${M}/hero-poster.jpg`} onScreen={onScreen} ok={ok} eager />}
    </div>
  );
}

export function MotionToggle({ className = '' }) {
  const isPaused = usePaused();
  const reduced = useMedia('(prefers-reduced-motion: reduce)');
  const small = useMedia('(max-width: 760px)');
  if (reduced || small) return null;
  return (
    <button type="button" className={`motion-toggle ${className}`} aria-pressed={isPaused} onClick={() => setMotionPaused(!isPaused)}>
      <span aria-hidden="true" className={`motion-toggle__icon${isPaused ? ' is-play' : ''}`} />
      {isPaused ? 'Play animation' : 'Pause animation'}
    </button>
  );
}

// ---------- research themes ----------
const VISUALS = {
  kg: 'Illustration: leaf venation feeding a network that links plants, compounds, protein targets and conditions',
  ai: 'Illustration: message passing over the molecular graph of quercetin, mapped into a learned embedding space',
  cat: 'Illustration: CO moving between hollow sites on an fcc(111) metal surface, traced on its energy profile',
  enz: 'Illustration: ferritin-like oxidoreductase (PDB 4Y08) with its iron site, approached by piperine',
};

/** Pick the visual whose science matches a research programme. */
export function themeVisual(t) {
  const s = `${t.title || ''} ${(t.keywords || []).join(' ')} ${t.summary || ''}`.toLowerCase();
  if (/biocatal|enzyme/.test(s)) return 'enz';
  if (/catalys|dft|adsorption|reaction barrier/.test(s)) return 'cat';
  if (/knowledge graph|ethnopharm|network pharmacology|classical text/.test(s)) return 'kg';
  if (/gnn|graph neural|screening|docking|drug discovery|admet|generative/.test(s)) return 'ai';
  return { 'AI/ML': 'ai', Chemistry: 'cat', Biology: 'kg' }[t.tag] || 'ai';
}

/** Research programme figure: an uploaded image if the admin set one, else the matching rendered loop. */
export function ThemeVisual({ thrust, className = '', caption = false }) {
  const ref = useRef(null);
  const ok = useMotionOK();
  const onScreen = useOnScreen(ref);
  if (thrust.image) {
    return <figure className={`sci sci--photo ${className}`}><img src={thrust.image} alt="" loading="lazy" /></figure>;
  }
  const key = themeVisual(thrust);
  return (
    <figure className={`sci ${className}`} ref={ref}>
      <img className="sci__poster" src={`${M}/theme-${key}.webp`} alt={caption ? '' : VISUALS[key]} loading="lazy" decoding="async" width="960" height="640" />
      <LoopVideo name={`theme-${key}`} poster={`${M}/theme-${key}.webp`} onScreen={onScreen} ok={ok} />
      {caption && <figcaption>{VISUALS[key]}</figcaption>}
    </figure>
  );
}

// ---------- research workflow strip ----------
export const WORKFLOW = [
  { img: 'wf-chem', title: 'Natural-product chemistry', text: 'Phytochemical structures and scaffolds', alt: 'Three-dimensional model of curcumin' },
  { img: 'wf-target', title: 'Molecular target', text: 'Proteins implicated in disease', alt: 'Ribbon model of c-Src kinase (PDB 2SRC) with its molecular surface' },
  { img: 'wf-dock', title: 'Computational screening', text: 'Docking and virtual screening against targets', alt: 'Close-up of a ligand in the ATP-binding pocket of c-Src kinase' },
  { img: 'wf-ml', title: 'AI and machine learning', text: 'Models that learn from molecular data', alt: 'Molecular graph and clusters in a learned embedding space' },
  { img: 'wf-cells', title: 'Biological validation', text: 'Assays that test predicted activity', alt: 'Fluorescence-microscopy-style image of cultured cells' },
];

export function Workflow() {
  return (
    <ol className="workflow">
      {WORKFLOW.map((s, i) => (
        <li key={s.img} className="workflow__step">
          <figure className="workflow__fig">
            <img src={`${M}/${s.img}.webp`} alt={s.alt} loading="lazy" decoding="async" width="800" height="600" />
          </figure>
          <p className="workflow__n">{String(i + 1).padStart(2, '0')}</p>
          <h3 className="workflow__title">{s.title}</h3>
          <p className="workflow__text">{s.text}</p>
        </li>
      ))}
    </ol>
  );
}
