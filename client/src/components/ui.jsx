import { useTitle } from '../lib/hooks.js';

/** Green band at the top of inner pages. */
export function PageHead({ title, intro, children }) {
  useTitle(title);
  return (
    <header className="pagehead">
      <div className="shell pagehead__inner">
        <h1>{title}</h1>
        {intro && <p className="pagehead__intro">{intro}</p>}
        {children}
      </div>
      <svg className="pagehead__vein" viewBox="0 0 1200 120" preserveAspectRatio="none" aria-hidden="true">
        <path d="M0 96 C220 70 380 104 600 78 S980 40 1200 60" />
        <path d="M300 88 C330 60 360 40 410 30" /><path d="M760 66 C800 40 850 28 900 24" />
      </svg>
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

/** Photo, or initials on a leaf-toned disc. */
export function Avatar({ name, src, size = 'md' }) {
  const initials = (name || '?').replace(/[[\]]/g, '').split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('') || '?';
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
