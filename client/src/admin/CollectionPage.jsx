import { useEffect, useState } from 'react';
import { api } from '../lib/api.js';
import { useApi } from '../lib/hooks.js';
import { Field } from './fields.jsx';
import { blankFor } from './schemas.js';

export default function CollectionPage({ schema }) {
  const list = useApi(schema.endpoint + (schema.listQuery || ''), { auth: true });
  const [editing, setEditing] = useState(null); // a document (with or without _id)
  const [flash, setFlash] = useState('');
  const items = list.data || [];

  useEffect(() => { setEditing(null); setFlash(''); }, [schema]);

  const startNew = () => { setEditing(blankFor(schema)); setFlash(''); };

  async function move(i, d) {
    const ids = items.map((x) => x._id);
    [ids[i], ids[i + d]] = [ids[i + d], ids[i]];
    try { await api(`${schema.endpoint}/reorder`, { method: 'POST', body: { ids } }); list.reload(); }
    catch (err) { setFlash(err.message); }
  }

  return (
    <div className="adm-page">
      <header className="adm-page__head">
        <div>
          <h1>{schema.label}</h1>
          <p className="adm-sub">{items.length} {items.length === 1 ? schema.singular : `${schema.singular}s`}{schema.orderable ? '. Use the arrows to set the order shown on the site.' : ''}</p>
        </div>
        <button className="adm-btn adm-btn--primary" onClick={startNew}>Add {schema.singular}</button>
      </header>
      {flash && <p className="adm-flash" role="status">{flash}</p>}

      <div className={`adm-split${editing ? ' is-editing' : ''}`}>
        <div className="adm-list">
          {list.loading && <p className="adm-muted">Loading…</p>}
          {list.error && <p className="adm-error">{list.error.message}</p>}
          {list.data && !items.length && <p className="adm-muted">Nothing here yet. Add the first {schema.singular}.</p>}
          <ul>
            {items.map((d, i) => (
              <li key={d._id} className={editing?._id === d._id ? 'is-active' : undefined}>
                <button className="adm-list__main" onClick={() => { setEditing(d); setFlash(''); }}>
                  {schema.thumb && ((typeof schema.thumb === 'function' ? schema.thumb(d) : d[schema.thumb]) ? <img src={typeof schema.thumb === 'function' ? schema.thumb(d) : d[schema.thumb]} alt="" /> : <span className="adm-list__ph" />)}
                  <span className="adm-list__text">
                    <strong>{d[schema.titleField] || `Untitled ${schema.singular}`}</strong>
                    <span>{schema.subtitle?.(d)}</span>
                  </span>
                </button>
                {schema.orderable && (
                  <span className="adm-list__order">
                    <button aria-label="Move up" disabled={i === 0} onClick={() => move(i, -1)}>▲</button>
                    <button aria-label="Move down" disabled={i === items.length - 1} onClick={() => move(i, 1)}>▼</button>
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>

        {editing && (
          <Editor
            key={editing._id || 'new'}
            schema={schema}
            initial={editing}
            onCancel={() => setEditing(null)}
            onSaved={(doc, msg) => { list.reload(); setEditing(doc); setFlash(msg); }}
            onDeleted={() => { list.reload(); setEditing(null); setFlash(`Deleted the ${schema.singular}.`); }}
            nextOrder={items.length}
          />
        )}
      </div>
    </div>
  );
}

function Editor({ schema, initial, onCancel, onSaved, onDeleted, nextOrder }) {
  const [doc, setDoc] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [dirty, setDirty] = useState(false);
  const isNew = !initial._id;
  const set = (name) => (v) => { setDoc((d) => ({ ...d, [name]: v })); setDirty(true); };

  async function save(e) {
    e.preventDefault();
    const missing = schema.fields.find((f) => f.required && !String(doc[f.name] ?? '').trim());
    if (missing) { setError(`${missing.label} is required.`); return; }
    setBusy(true); setError('');
    try {
      const body = { ...doc };
      if (isNew && schema.orderable) body.order = nextOrder;
      if (body.deadline === '') body.deadline = null;
      if (body.year === '') body.year = null;
      const saved = isNew
        ? await api(schema.endpoint, { method: 'POST', body })
        : await api(`${schema.endpoint}/${doc._id}`, { method: 'PUT', body });
      setDirty(false);
      onSaved(saved, isNew ? `Added. It is now live on the website.` : 'Saved. The website shows your changes.');
    } catch (err) { setError(err.message); } finally { setBusy(false); }
  }

  async function remove() {
    setBusy(true);
    try { await api(`${schema.endpoint}/${doc._id}`, { method: 'DELETE' }); onDeleted(); }
    catch (err) { setError(err.message); setBusy(false); }
  }

  return (
    <form className="adm-editor" onSubmit={save}>
      <div className="adm-editor__head">
        <h2>{isNew ? `New ${schema.singular}` : `Edit ${schema.singular}`}</h2>
        <button type="button" className="adm-btn adm-btn--quiet" onClick={onCancel}>Close</button>
      </div>
      {schema.doiImport && <DoiImport onFill={(meta) => { setDoc((d) => ({ ...d, ...meta })); setDirty(true); }} />}
      <div className="adm-editor__fields">
        {schema.fields.map((f) => (
          <Field key={f.name} def={f} value={doc[f.name]} onChange={set(f.name)} idPrefix={`${schema.endpoint.slice(1)}-${doc._id || 'new'}`} />
        ))}
      </div>
      {error && <p className="adm-error" role="alert">{error}</p>}
      <div className="adm-editor__actions">
        <button className="adm-btn adm-btn--primary" type="submit" disabled={busy}>{busy ? 'Saving…' : isNew ? `Add ${schema.singular}` : 'Save changes'}</button>
        {dirty && <span className="adm-muted">Unsaved changes</span>}
        {!isNew && (confirmDelete
          ? <span className="adm-confirm">Delete permanently? <button type="button" className="adm-btn adm-btn--danger" onClick={remove} disabled={busy}>Delete</button><button type="button" className="adm-btn adm-btn--quiet" onClick={() => setConfirmDelete(false)}>Keep</button></span>
          : <button type="button" className="adm-btn adm-btn--quiet adm-btn--push" onClick={() => setConfirmDelete(true)}>Delete…</button>)}
      </div>
    </form>
  );
}

function DoiImport({ onFill }) {
  const [doi, setDoi] = useState('');
  const [state, setState] = useState({ busy: false, msg: '', error: false });
  async function lookup() {
    if (!doi.trim()) return;
    setState({ busy: true, msg: '', error: false });
    try {
      const meta = await api(`/publications/doi/lookup?doi=${encodeURIComponent(doi.trim())}`, { auth: true });
      onFill(meta);
      setState({ busy: false, msg: 'Filled in from Crossref. Check the details, then save.', error: false });
    } catch (err) { setState({ busy: false, msg: err.message, error: true }); }
  }
  return (
    <div className="adm-doi">
      <label htmlFor="doi-import">Import from DOI</label>
      <div className="adm-doi__row">
        <input id="doi-import" type="text" placeholder="10.1021/acscatal.0c04525 or https://doi.org/…" value={doi}
          onChange={(e) => setDoi(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); lookup(); } }} />
        <button type="button" className="adm-btn" onClick={lookup} disabled={state.busy}>{state.busy ? 'Looking up…' : 'Fill in'}</button>
      </div>
      {state.msg && <p className={state.error ? 'adm-error' : 'adm-ok'} role="status">{state.msg}</p>}
    </div>
  );
}
