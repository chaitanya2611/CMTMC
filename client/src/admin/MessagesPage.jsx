import { useState } from 'react';
import { api } from '../lib/api.js';
import { useApi } from '../lib/hooks.js';

export default function MessagesPage({ onChange }) {
  const { data, error, loading, reload } = useApi('/messages', { auth: true });
  const [openId, setOpenId] = useState(null);
  const [confirmId, setConfirmId] = useState(null);
  const [flash, setFlash] = useState('');

  async function setRead(m, read) {
    try { await api(`/messages/${m._id}`, { method: 'PATCH', body: { read } }); reload(); onChange?.(); }
    catch (e) { setFlash(e.message); }
  }
  async function remove(m) {
    try { await api(`/messages/${m._id}`, { method: 'DELETE' }); setConfirmId(null); setFlash('Message deleted.'); reload(); onChange?.(); }
    catch (e) { setFlash(e.message); }
  }
  function toggle(m) {
    const next = openId === m._id ? null : m._id;
    setOpenId(next);
    if (next && !m.read) setRead(m, true);
  }

  const unread = (data || []).filter((m) => !m.read).length;
  return (
    <div className="adm-page">
      <header className="adm-page__head">
        <div><h1>Messages</h1><p className="adm-sub">Sent through the Contact page. {data ? `${unread} unread of ${data.length}.` : ''}</p></div>
      </header>
      {flash && <p className="adm-flash" role="status">{flash}</p>}
      {loading && <p className="adm-muted">Loading…</p>}
      {error && <p className="adm-error">{error.message}</p>}
      {data && !data.length && <p className="adm-muted">No messages yet. They will appear here when visitors use the contact form.</p>}
      <ul className="adm-inbox">
        {(data || []).map((m) => (
          <li key={m._id} className={`${m.read ? '' : 'is-unread'}${openId === m._id ? ' is-open' : ''}`}>
            <button className="adm-inbox__row" onClick={() => toggle(m)} aria-expanded={openId === m._id}>
              <span className="adm-inbox__from"><strong>{m.name}</strong><span>{m.email}</span></span>
              <span className="adm-inbox__subj">{m.subject || m.body.slice(0, 80)}</span>
              <time dateTime={m.createdAt}>{new Date(m.createdAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</time>
            </button>
            {openId === m._id && (
              <div className="adm-inbox__body">
                {m.subject && <p className="adm-inbox__subjfull">{m.subject}</p>}
                <p className="adm-inbox__text">{m.body}</p>
                <div className="adm-inbox__actions">
                  <a className="adm-btn adm-btn--primary" href={`mailto:${m.email}?subject=${encodeURIComponent('Re: ' + (m.subject || 'Your message'))}`}>Reply by email</a>
                  <button className="adm-btn" onClick={() => setRead(m, !m.read)}>{m.read ? 'Mark as unread' : 'Mark as read'}</button>
                  {confirmId === m._id
                    ? <span className="adm-confirm">Delete permanently? <button className="adm-btn adm-btn--danger" onClick={() => remove(m)}>Delete</button><button className="adm-btn adm-btn--quiet" onClick={() => setConfirmId(null)}>Keep</button></span>
                    : <button className="adm-btn adm-btn--quiet" onClick={() => setConfirmId(m._id)}>Delete…</button>}
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
