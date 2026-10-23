import { useEffect, useState } from 'react';
import { api } from '../lib/api.js';
import { Field } from './fields.jsx';

const GROUPS = [
  { title: 'Announcement bar (top of every page)', fields: [
    { name: 'bannerOn', label: 'Show the announcement bar', kind: 'checkbox' },
    { name: 'bannerText', label: 'Announcement text, e.g. Winter School on AI for Natural Products, 12–14 Dec 2026', kind: 'text' },
    { name: 'bannerLabel', label: 'Button text (optional), e.g. Register', kind: 'text' },
    { name: 'bannerLink', label: 'Button link (optional): https://… or a page such as /news', kind: 'text' },
  ] },
  { title: 'Identity', fields: [
    { name: 'shortName', label: 'Short name (shown in the header)', kind: 'text' },
    { name: 'name', label: 'Full centre name', kind: 'text' },
  ] },
  { title: 'Home page', fields: [
    { name: 'heroTitle', label: 'Headline', kind: 'text' },
    { name: 'heroText', label: 'Introduction under the headline', kind: 'textarea', rows: 4 },
  ] },
  { title: 'About page', fields: [
    { name: 'about', label: 'About: first part', kind: 'textarea', rows: 6 },
    { name: 'aboutMore', label: 'About: second part', kind: 'textarea', rows: 6 },
    { name: 'mission', label: 'Mission', kind: 'textarea', rows: 3 },
    { name: 'vision', label: 'Vision', kind: 'textarea', rows: 3 },
    { name: 'closingStatement', label: 'Closing statement', kind: 'textarea', rows: 6 },
  ] },
  { title: 'Contact & openings', fields: [
    { name: 'joinText', label: 'Introduction on the Openings page', kind: 'textarea', rows: 4 },
    { name: 'email', label: 'Contact email', kind: 'text' },
    { name: 'phone', label: 'Phone (leave empty to hide)', kind: 'text' },
    { name: 'address', label: 'Postal address', kind: 'textarea', rows: 4 },
  ] },
];
const SOCIAL = [['linkedin', 'LinkedIn'], ['twitter', 'X / Twitter'], ['github', 'GitHub'], ['youtube', 'YouTube']];
const LISTS = [
  { name: 'objectives', title: 'Objectives (About page, in order)', item: 'objective', cols: [['title', 'Objective'], ['text', 'Description']] },
  { name: 'pipeline', title: 'How a project runs (steps, in order)', item: 'step', cols: [['title', 'Step'], ['text', 'Description']] },
  { name: 'partners', title: 'Partners and collaborators', item: 'partner', cols: [['name', 'Name'], ['link', 'Website (https://…)']] },
];

export default function SettingsPage({ onSaved }) {
  const [doc, setDoc] = useState(null);
  const [state, setState] = useState({ busy: false, msg: '', error: '' });
  const [dirty, setDirty] = useState(false);

  useEffect(() => { api('/settings').then(setDoc).catch((e) => setState((s) => ({ ...s, error: e.message }))); }, []);
  if (!doc) return <div className="adm-page"><h1>Site settings</h1><p className={state.error ? 'adm-error' : 'adm-muted'}>{state.error || 'Loading…'}</p></div>;

  const set = (k) => (v) => { setDoc((d) => ({ ...d, [k]: v })); setDirty(true); };
  const setList = (k, list) => { setDoc((d) => ({ ...d, [k]: list })); setDirty(true); };

  async function save(e) {
    e.preventDefault();
    setState({ busy: true, msg: '', error: '' });
    try {
      const saved = await api('/settings', { method: 'PUT', body: doc });
      setDoc(saved); setDirty(false);
      setState({ busy: false, msg: 'Saved. The website shows your changes.', error: '' });
      onSaved?.();
    } catch (err) { setState({ busy: false, msg: '', error: err.message }); }
  }

  return (
    <form className="adm-page" onSubmit={save}>
      <header className="adm-page__head adm-page__head--sticky">
        <div><h1>Site settings</h1><p className="adm-sub">Text that appears across the website.</p></div>
        <div className="adm-savebar">
          {dirty && <span className="adm-muted">Unsaved changes</span>}
          <button className="adm-btn adm-btn--primary" type="submit" disabled={state.busy}>{state.busy ? 'Saving…' : 'Save settings'}</button>
        </div>
      </header>
      {state.msg && <p className="adm-flash" role="status">{state.msg}</p>}
      {state.error && <p className="adm-error" role="alert">{state.error}</p>}

      {GROUPS.map((g) => (
        <fieldset key={g.title} className="adm-card">
          <legend>{g.title}</legend>
          {g.fields.map((f) => <Field key={f.name} def={f} value={doc[f.name]} onChange={set(f.name)} idPrefix="settings" />)}
        </fieldset>
      ))}

      <fieldset className="adm-card">
        <legend>Social links</legend>
        <div className="adm-grid2">
          {SOCIAL.map(([k, label]) => (
            <Field key={k} def={{ name: k, label, kind: 'url' }} value={doc.social?.[k]} idPrefix="social"
              onChange={(v) => { setDoc((d) => ({ ...d, social: { ...(d.social || {}), [k]: v } })); setDirty(true); }} />
          ))}
        </div>
      </fieldset>

      {LISTS.map((l) => (
        <fieldset key={l.name} className="adm-card">
          <legend>{l.title}</legend>
          <ListEditor def={l} rows={doc[l.name] || []} onChange={(rows) => setList(l.name, rows)} />
        </fieldset>
      ))}
    </form>
  );
}

function ListEditor({ def, rows, onChange }) {
  const update = (i, k, v) => onChange(rows.map((r, j) => (j === i ? { ...r, [k]: v } : r)));
  const move = (i, d) => { const c = [...rows]; [c[i], c[i + d]] = [c[i + d], c[i]]; onChange(c); };
  return (
    <div className="adm-rows">
      {!rows.length && <p className="adm-muted">None yet. This part of the site stays hidden until you add one.</p>}
      {rows.map((r, i) => (
        <div key={i} className="adm-row">
          {def.cols.map(([k, label]) => (
            <div key={k} className="adm-field">
              <label htmlFor={`${def.name}-${i}-${k}`}>{label}</label>
              {k === 'text'
                ? <textarea id={`${def.name}-${i}-${k}`} rows={2} value={r[k] || ''} onChange={(e) => update(i, k, e.target.value)} />
                : <input id={`${def.name}-${i}-${k}`} type="text" value={r[k] || ''} onChange={(e) => update(i, k, e.target.value)} />}
            </div>
          ))}
          <div className="adm-row__tools">
            <button type="button" aria-label="Move up" disabled={i === 0} onClick={() => move(i, -1)}>▲</button>
            <button type="button" aria-label="Move down" disabled={i === rows.length - 1} onClick={() => move(i, 1)}>▼</button>
            <button type="button" className="adm-danger-text" onClick={() => onChange(rows.filter((_, j) => j !== i))}>Remove</button>
          </div>
        </div>
      ))}
      <button type="button" className="adm-btn" onClick={() => onChange([...rows, Object.fromEntries(def.cols.map(([k]) => [k, '']))])}>Add {def.item}</button>
    </div>
  );
}
