import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useTitle } from '../lib/hooks.js';

// Background image behind each inner page's header, chosen by section
const HEAD_BG = {
  about: 'hero', research: 'cells', people: 'network', publications: 'sequence', gallery: 'network',
  news: 'hero', openings: 'network', contact: 'sequence',
};

/** Dark band with a section image at the top of inner pages. */
export function PageHead({ title, intro, kicker, children }) {
  useTitle(title);
  const { pathname } = useLocation();
  const bg = HEAD_BG[pathname.split('/')[1]] || 'hero';
  return (
    <header className={`pagehead pagehead--${bg}`}>
      <div className="shell pagehead__inner">
        {kicker && <p className="kicker">{kicker}</p>}
        <h1>{title}</h1>
        {intro && <p className="pagehead__intro">{intro}</p>}
        {children}
      </div>
    </header>
  );
}

/** Text with blank-line-separated paragraphs. */
export function Paragraphs({ text, className }) {
  if (!text) return null;
  return String(text).split(/\n\s*\n/).map((p, i) => <p key={i} className={className}>{p}</p>);
}

export function Loading({ label = 'Loading' }) {
  return <p className="state state--loading" role="status">{label}…</p>;
}

export function ErrorNote({ error, onRetry }) {
  return (
    <div className="state state--error" role="alert">
      <p>{error?.message || 'Could not load this section.'}</p>
      {onRetry && <button className="btn btn--line" onClick={onRetry}>Try again</button>}
    </div>
  );
}

export function Empty({ children }) {
  return <p className="state">{children}</p>;
}

/** Round photo, or initials on a discipline-toned disc. */
export function Avatar({ name, src, size = 'md' }) {
  const initials = (name || '?').replace(/[[\]]/g, '').replace(/^(Prof\.|Dr\.)\s*/i, '').split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('') || '?';
  if (src) return <img className={`avatar avatar--${size}`} src={src} alt="" loading="lazy" />;
  let h = 0; for (const c of name || '') h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return <span className={`avatar avatar--${size} avatar--tone${h % 3}`} aria-hidden="true">{initials}</span>;
}

export const TAG_CLASS = { 'AI/ML': 'ml', Chemistry: 'chem', Biology: 'bio' };
export function DisciplineTag({ tag }) {
  return <span className={`dtag dtag--${TAG_CLASS[tag] || 'bio'}`}>{tag}</span>;
}

export function ExternalLink({ href, children, className }) {
  if (!href) return <>{children}</>;
  return <a className={className} href={href} target="_blank" rel="noreferrer">{children}</a>;
}

/** Native modal dialog: focus is trapped, Esc and the backdrop close it. */
export function Modal({ open, onClose, label, className = '', children }) {
  const ref = useRef(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);
  return (
    <dialog ref={ref} className={`modal ${className}`} aria-label={label} onClose={onClose}
      onClick={(e) => { if (e.target === ref.current) onClose(); }}>
      {open && (
        <div className="modal__body">
          <button type="button" className="modal__close" onClick={onClose} aria-label="Close">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
          </button>
          {children}
        </div>
      )}
    </dialog>
  );
}

export function Arrow({ dir = 'right' }) {
  const d = dir === 'left' ? 'M15 6l-6 6 6 6' : 'M9 6l6 6-6 6';
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true"><path d={d} /></svg>;
}
