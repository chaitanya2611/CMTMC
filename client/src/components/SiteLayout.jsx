import { useEffect, useState } from 'react';
import { NavLink, Link, Outlet, useLocation } from 'react-router-dom';
import { SiteContext, useApi } from '../lib/hooks.js';
import Logo from './Logo.jsx';

const NAV = [
  ['/about', 'About'],
  ['/research', 'Research'],
  ['/people', 'People'],
  ['/publications', 'Publications'],
  ['/news', 'News & events'],
  ['/openings', 'Openings'],
  ['/contact', 'Contact'],
];

export default function SiteLayout() {
  const { data: settings, reload } = useApi('/settings');
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => { setOpen(false); window.scrollTo(0, 0); }, [pathname]);

  const s = settings || {};
  const onDark = pathname === '/';

  return (
    <SiteContext.Provider value={{ settings, reload }}>
      <a className="skip" href="#main">Skip to content</a>
      <header className={`masthead${onDark ? ' masthead--dark' : ''}${open ? ' is-open' : ''}`}>
        <div className="shell masthead__row">
          <Link to="/" className="wordmark" aria-label={`${s.shortName || 'CMTMC'} home`}>
            <Logo />
            <span className="wordmark__text">
              <strong>{s.shortName || 'CMTMC'}</strong>
              <span>Machine learning for traditional medicine &amp; catalysis</span>
            </span>
          </Link>
          <button className="menu-toggle" aria-expanded={open} aria-controls="site-nav" onClick={() => setOpen((o) => !o)}>
            {open ? 'Close' : 'Menu'}
          </button>
          <nav id="site-nav" className="mainnav" aria-label="Main">
            {NAV.map(([to, label]) => <NavLink key={to} to={to}>{label}</NavLink>)}
          </nav>
        </div>
      </header>

      <main id="main"><Outlet /></main>

      <footer className="colophon">
        <div className="shell colophon__grid">
          <div className="colophon__id">
            <Logo size={40} />
            <p className="colophon__name">{s.name || 'Centre for Machine Learning–Driven Traditional Medicine and Catalysis'}</p>
            {s.address && <p className="colophon__addr">{s.address}</p>}
          </div>
          <nav className="colophon__links" aria-label="Footer">
            {NAV.map(([to, label]) => <Link key={to} to={to}>{label}</Link>)}
          </nav>
          <div className="colophon__contact">
            {s.email && <p><a href={`mailto:${s.email}`}>{s.email}</a></p>}
            {s.phone && <p>{s.phone}</p>}
            <p className="colophon__social">
              {s.social?.linkedin && <a href={s.social.linkedin} target="_blank" rel="noreferrer">LinkedIn</a>}
              {s.social?.twitter && <a href={s.social.twitter} target="_blank" rel="noreferrer">X / Twitter</a>}
              {s.social?.github && <a href={s.social.github} target="_blank" rel="noreferrer">GitHub</a>}
              {s.social?.youtube && <a href={s.social.youtube} target="_blank" rel="noreferrer">YouTube</a>}
            </p>
          </div>
        </div>
        <div className="shell colophon__base">
          <span>© {new Date().getFullYear()} {s.shortName || 'CMTMC'}</span>
          <Link to="/admin">Admin sign in</Link>
        </div>
      </footer>
    </SiteContext.Provider>
  );
}
