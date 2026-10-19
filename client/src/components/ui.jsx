import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTitle } from '../lib/hooks.js';

/** Inner-page header: breadcrumb, eyebrow, title, short introduction. */
export function PageHead({ title, intro, kicker, crumbs, children }) {
  useTitle(title);
  const trail = crumbs || (kicker ? [[null, kicker]] : []);
  return (
    <header className="pagehead">
      <div className="shell pagehead__inner">
        <nav className="crumbs" aria-label="Breadcrumb">
          <ol>
            <li><Link to="/">Home</Link></li>
            {trail.map(([to, label]) => <li key={label}>{to ? <Link to={to}>{label}</Link> : <span aria-current="page">{label}</span>}</li>)}
          </ol>
        </nav>
        <h1>{title}</h1>
        {intro && <p className="pagehead__intro">{intro}</p>}
        {children}
      </div>
    </header>
  );
}

/** Text with blank-line-separated paragraphs. */
export function Paragraphs({ text, className, limit }) {
  if (!text) return null;
  const parts = String(text).split(/\n\s*\n/);
  return (limit ? parts.slice(0, limit) : parts).map((p, i) => <p key={i} className={className}>{p}</p>);
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

/** Rectangular portrait, or initials on a plain panel when no photo exists. */
export function Avatar({ name, src, size = 'md' }) {
  const initials = (name || '?').replace(/[[\]]/g, '').replace(/^(Prof\.|Dr\.)\s*/i, '').split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('') || '?';
  if (src) return <img className={`portrait portrait--${size}`} src={src} alt="" loading="lazy" />;
  return <span className={`portrait portrait--${size} portrait--empty`} aria-hidden="true">{initials}</span>;
}

export const TAG_CLASS = { 'AI/ML': 'ml', Chemistry: 'chem', Biology: 'bio' };
export function DisciplineTag({ tag }) {
  if (!tag) return null;
  return <span className="dtag">{tag === 'AI/ML' ? 'Machine learning' : tag}</span>;
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
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
          </button>
          {children}
        </div>
      )}
    </dialog>
  );
}

export function Arrow({ dir = 'right' }) {
  const d = dir === 'left' ? 'M15 6l-6 6 6 6' : 'M9 6l6 6-6 6';
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d={d} /></svg>;
}

/** "Name, Initials" citation-style date, e.g. 12 Nov 2026 */
export function DateBlock({ date }) {
  if (!date) return null;
  const d = new Date(date);
  if (isNaN(d)) return null;
  return (
    <time className="dateblock" dateTime={d.toISOString()}>
      <span className="dateblock__day">{d.getDate()}</span>
      <span className="dateblock__mon">{d.toLocaleDateString('en-IN', { month: 'short' })} {d.getFullYear()}</span>
    </time>
  );
}
