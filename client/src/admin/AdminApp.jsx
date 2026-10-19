import { useCallback, useEffect, useState } from 'react';
import { Routes, Route, NavLink, Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth.jsx';
import { api } from '../lib/api.js';
import { useApi } from '../lib/hooks.js';
import Logo from '../components/Logo.jsx';
import CollectionPage from './CollectionPage.jsx';
import SettingsPage from './SettingsPage.jsx';
import MessagesPage from './MessagesPage.jsx';
import { COLLECTIONS } from './schemas.js';

export default function AdminApp() {
  const { admin, checking } = useAuth();
  useEffect(() => { document.title = 'Admin | CMTMC'; }, []);
  if (checking) return <div className="adm-boot">Checking your session…</div>;
  return (
    <Routes>
      <Route path="login" element={admin ? <Navigate to="/admin" replace /> : <Login />} />
      <Route path="*" element={admin ? <Shell /> : <Navigate to="/admin/login" replace />} />
    </Routes>
  );
}

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [state, setState] = useState({ busy: false, error: '' });
  async function submit(e) {
    e.preventDefault();
    setState({ busy: true, error: '' });
    try { await login(form.email, form.password); navigate('/admin', { replace: true }); }
    catch (err) { setState({ busy: false, error: err.message }); }
  }
  return (
    <div className="adm-login">
      <form className="adm-login__card" onSubmit={submit}>
        <Link to="/" className="adm-login__brand"><Logo size={40} /><span>CMTMC admin</span></Link>
        <h1>Sign in</h1>
        <div className="adm-field">
          <label htmlFor="login-email">Email</label>
          <input id="login-email" type="email" autoComplete="username" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </div>
        <div className="adm-field">
          <label htmlFor="login-password">Password</label>
          <input id="login-password" type="password" autoComplete="current-password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        </div>
        {state.error && <p className="adm-error" role="alert">{state.error}</p>}
        <button className="adm-btn adm-btn--primary adm-btn--block" type="submit" disabled={state.busy}>{state.busy ? 'Signing in…' : 'Sign in'}</button>
        <Link className="adm-login__back" to="/">Back to the website</Link>
      </form>
    </div>
  );
}

function Shell() {
  const { admin, logout } = useAuth();
  const [unread, setUnread] = useState(0);
  const [menu, setMenu] = useState(false);
  const refreshUnread = useCallback(() => { api('/messages/unread-count', { auth: true }).then((r) => setUnread(r.count)).catch(() => {}); }, []);
  useEffect(() => { refreshUnread(); }, [refreshUnread]);

  return (
    <div className="adm">
      <aside className={`adm-side${menu ? ' is-open' : ''}`}>
        <div className="adm-side__top">
          <Link to="/admin" className="adm-side__brand"><Logo size={30} /><span>CMTMC admin</span></Link>
          <button className="adm-side__toggle" onClick={() => setMenu((m) => !m)} aria-expanded={menu}>{menu ? 'Close' : 'Menu'}</button>
        </div>
        <nav className="adm-nav" onClick={() => setMenu(false)}>
          <NavLink end to="/admin">Overview</NavLink>
          <NavLink to="/admin/settings">Site settings</NavLink>
          <p className="adm-nav__label">Content</p>
          {Object.entries(COLLECTIONS).map(([k, c]) => <NavLink key={k} to={`/admin/${k}`}>{c.label}</NavLink>)}
          <p className="adm-nav__label">Inbox</p>
          <NavLink to="/admin/messages">Messages {unread > 0 && <span className="adm-badge">{unread}</span>}</NavLink>
        </nav>
        <div className="adm-side__foot">
          <a href="/" target="_blank" rel="noreferrer">View website</a>
          <span className="adm-side__who">{admin.email}</span>
          <button className="adm-btn adm-btn--quiet" onClick={logout}>Sign out</button>
        </div>
      </aside>
      <main className="adm-main">
        <Routes>
          <Route index element={<Overview unread={unread} />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="messages" element={<MessagesPage onChange={refreshUnread} />} />
          {Object.entries(COLLECTIONS).map(([k, c]) => <Route key={k} path={k} element={<CollectionPage schema={c} />} />)}
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </main>
    </div>
  );
}

function Overview({ unread }) {
  const { data } = useApi('/admin/summary', { auth: true });
  const tiles = [
    ['Research thrusts', data?.thrusts, '/admin/thrusts'],
    ['People', data?.people, '/admin/people'],
    ['Publications', data?.publications, '/admin/publications'],
    ['Gallery albums', data?.albums, '/admin/albums'],
    ['News & events', data?.news, '/admin/news'],
    ['Open positions', data?.openings, '/admin/openings'],
    ['Unread messages', unread, '/admin/messages'],
  ];
  return (
    <div className="adm-page">
      <header className="adm-page__head"><div><h1>Overview</h1><p className="adm-sub">Changes you save go live on the website immediately.</p></div></header>
      <div className="adm-tiles">
        {tiles.map(([label, n, to]) => (
          <Link key={label} to={to} className={`adm-tile${label === 'Unread messages' && unread ? ' adm-tile--alert' : ''}`}>
            <span className="adm-tile__n">{n ?? '–'}</span><span>{label}</span>
          </Link>
        ))}
      </div>
      <section className="adm-card">
        <h2>Common tasks</h2>
        <ul className="adm-tasks">
          <li><Link to="/admin/people">Add a team member with a photo</Link></li>
          <li><Link to="/admin/publications">Import a paper from its DOI</Link></li>
          <li><Link to="/admin/news">Announce a seminar or event</Link></li>
          <li><Link to="/admin/openings">Post or close a position</Link></li>
          <li><Link to="/admin/albums">Create a photo album</Link></li>
          <li><Link to="/admin/settings">Turn on the announcement bar</Link></li>
          <li><Link to="/admin/settings">Edit the home page headline and contact details</Link></li>
        </ul>
      </section>
    </div>
  );
}
