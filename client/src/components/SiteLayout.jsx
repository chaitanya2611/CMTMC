import { useEffect, useState } from 'react';
import { NavLink, Link, Outlet, useLocation } from 'react-router-dom';
import { SiteContext, useApi } from '../lib/hooks.js';
import Logo from './Logo.jsx';

const NAV = [
  ['/', 'Home', true],
  ['/about', 'About'],
  ['/research', 'Research'],
  ['/people', 'People'],
  ['/publications', 'Publications'],
  ['/gallery', 'Gallery'],
  ['/news', 'News'],
  ['/openings', 'Opportunities'],
  ['/contact', 'Contact'],
];

function Banner({ s }) {
  if (!s.bannerOn || !s.bannerText) return null;
  const internal = s.bannerLink?.startsWith('/') && !s.bannerLink.startsWith('/uploads/');
  const label = s.bannerLabel || 'Details';
  return (
    <div className="banner" role="region" aria-label="Announcement">
      <div className="shell banner__inner">
        <span className="banner__tag">Announcement</span>
        <span>{s.bannerText}</span>
        {s.bannerLink && (internal ? <Link to={s.bannerLink}>{label}</Link> : <a href={s.bannerLink} target="_blank" rel="noreferrer">{label}</a>)}
      </div>
    </div>
  );
}

export default function SiteLayout() {
  const { data: settings, reload } = useApi('/settings');
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => { setOpen(false); window.scrollTo(0, 0); }, [pathname]);

  const s = settings || {};
  const fullName = s.name || 'Centre for Machine Learning–Driven Traditional Medicine and Catalysis';

  return (
    <SiteContext.Provider value={{ settings, reload }}>
      <a className="skip" href="#main">Skip to content</a>
      <Banner s={s} />
      <div className="utility">
        <div className="shell utility__inner">
          <a href="https://www.iitb.ac.in" target="_blank" rel="noreferrer">Indian Institute of Technology Bombay ↗</a>
          <span className="utility__focus" aria-hidden="true">AI × Chemistry × Traditional Medicine</span>
          <span className="utility__links">
            {s.email && <a href={`mailto:${s.email}`}>{s.email}</a>}
            <Link to="/contact">Contact</Link>
          </span>
        </div>
      </div>
      <header className={`masthead${open ? ' is-open' : ''}`}>
        <div className="shell masthead__row">
          <Link to="/" className="wordmark" aria-label={`${s.shortName || 'CMTMC'}, ${fullName}, IIT Bombay. Home`}>
            <Logo size={44} />
          </Link>
          <nav id="site-nav" className="mainnav" aria-label="Main">
            <div className="mainnav__row">
              {NAV.map(([to, label, end]) => <NavLink key={to} to={to} end={end}>{label}</NavLink>)}
            </div>
          </nav>
          <Link className="masthead__cta" to="/openings">Join the centre <span aria-hidden="true">↗</span></Link>
          <button className="menu-toggle" aria-expanded={open} aria-controls="site-nav" onClick={() => setOpen((o) => !o)}>
            <span aria-hidden="true" className="menu-toggle__bars" />{open ? 'Close' : 'Menu'}
          </button>
        </div>
      </header>

      <main id="main"><Outlet /></main>

      <footer className="colophon">
        <div className="shell colophon__lead">
          <div>
            <p className="kicker">Work with CMTMC</p>
            <h2>Turn complex molecular questions into collaborative research.</h2>
          </div>
          <Link className="btn btn--light" to="/contact">Start a conversation <span aria-hidden="true">↗</span></Link>
        </div>
        <div className="shell colophon__grid">
          <div className="colophon__id">
            <p className="colophon__short">{s.shortName || 'CMTMC'}</p>
            <p className="colophon__name">{fullName}</p>
            <p className="colophon__addr">{s.address && !/^Add your/i.test(s.address) ? s.address : 'Indian Institute of Technology Bombay\nPowai, Mumbai, Maharashtra 400076\nIndia'}</p>
          </div>
          <div>
            <h2 className="colophon__h">The centre</h2>
            <ul className="colophon__links">
              <li><Link to="/about">About</Link></li>
              <li><Link to="/research">Research</Link></li>
              <li><Link to="/people">People</Link></li>
              <li><Link to="/publications">Publications</Link></li>
            </ul>
          </div>
          <div>
            <h2 className="colophon__h">Updates</h2>
            <ul className="colophon__links">
              <li><Link to="/news">News &amp; events</Link></li>
              <li><Link to="/gallery">Gallery</Link></li>
              <li><Link to="/openings">Opportunities</Link></li>
              <li><a href="https://www.iitb.ac.in" target="_blank" rel="noreferrer">IIT Bombay</a></li>
            </ul>
          </div>
          <div>
            <h2 className="colophon__h">Contact</h2>
            <ul className="colophon__links">
              {s.email && <li><a href={`mailto:${s.email}`}>{s.email}</a></li>}
              {s.phone && <li>{s.phone}</li>}
              <li><Link to="/contact">Send a message</Link></li>
              {s.social?.linkedin && <li><a href={s.social.linkedin} target="_blank" rel="noreferrer">LinkedIn</a></li>}
              {s.social?.twitter && <li><a href={s.social.twitter} target="_blank" rel="noreferrer">X / Twitter</a></li>}
              {s.social?.github && <li><a href={s.social.github} target="_blank" rel="noreferrer">GitHub</a></li>}
              {s.social?.youtube && <li><a href={s.social.youtube} target="_blank" rel="noreferrer">YouTube</a></li>}
            </ul>
          </div>
        </div>
        <div className="shell colophon__base">
          <span>© {new Date().getFullYear()} {s.shortName || 'CMTMC'}, Indian Institute of Technology Bombay</span>
          <Link to="/admin">Staff sign in</Link>
        </div>
      </footer>
    </SiteContext.Provider>
  );
}
