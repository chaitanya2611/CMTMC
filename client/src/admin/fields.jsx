import { useRef, useState } from 'react';
import { uploadImage } from '../lib/api.js';

const toDateInput = (v) => (v ? String(v).slice(0, 10) : '');

export function Field({ def, value, onChange, idPrefix }) {
  const id = `${idPrefix}-${def.name}`;
  const label = <label htmlFor={id}>{def.label}{def.required && <span className="req"> *</span>}</label>;
  const help = def.help && <p className="adm-help">{def.help}</p>;

  switch (def.kind) {
    case 'textarea':
      return <div className="adm-field">{label}<textarea id={id} rows={def.rows || 4} value={value ?? ''} onChange={(e) => onChange(e.target.value)} />{help}</div>;
    case 'select':
      return (
        <div className="adm-field">{label}
          <select id={id} value={value ?? def.options[0]} onChange={(e) => onChange(e.target.value)}>
            {def.options.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>{help}
        </div>
      );
    case 'number':
      return <div className="adm-field">{label}<input id={id} type="number" value={value ?? ''} onChange={(e) => onChange(e.target.value === '' ? '' : Number(e.target.value))} />{help}</div>;
    case 'date':
      return <div className="adm-field">{label}<input id={id} type="date" value={toDateInput(value)} onChange={(e) => onChange(e.target.value)} />{help}</div>;
    case 'checkbox':
      return (
        <div className="adm-field adm-field--check">
          <input id={id} type="checkbox" checked={Boolean(value)} onChange={(e) => onChange(e.target.checked)} />
          <label htmlFor={id}>{def.label}</label>
        </div>
      );
    case 'tags':
      return <TagsField id={id} label={label} help={help} value={value} onChange={onChange} />;
    case 'image':
      return <ImageField id={id} label={def.label} value={value} onChange={onChange} />;
    case 'images':
      return <ImagesField id={id} label={def.label} value={value} onChange={onChange} />;
    case 'url':
      return <div className="adm-field">{label}<input id={id} type="url" inputMode="url" placeholder="https://" value={value ?? ''} onChange={(e) => onChange(e.target.value.trim())} />{help}</div>;
    default:
      return <div className="adm-field">{label}<input id={id} type="text" value={value ?? ''} onChange={(e) => onChange(e.target.value)} />{help}</div>;
  }
}

function TagsField({ id, label, help, value, onChange }) {
  // keep the raw text while typing so commas and spaces aren't swallowed
  const [text, setText] = useState((value || []).join(', '));
  return (
    <div className="adm-field">{label}
      <input id={id} type="text" value={text}
        onChange={(e) => { setText(e.target.value); onChange(e.target.value.split(',').map((s) => s.trim()).filter(Boolean)); }} />
      {help}
    </div>
  );
}

function ImageField({ id, label, value, onChange }) {
  const input = useRef(null);
  const [state, setState] = useState({ busy: false, error: '' });
  async function pick(e) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setState({ busy: false, error: 'Images must be 5 MB or smaller.' }); return; }
    setState({ busy: true, error: '' });
    try { const { url } = await uploadImage(file); onChange(url); setState({ busy: false, error: '' }); }
    catch (err) { setState({ busy: false, error: err.message }); }
  }
  return (
    <div className="adm-field">
      <label htmlFor={id}>{label}</label>
      <div className="adm-image">
        {value ? <img src={value} alt="" /> : <div className="adm-image__ph">No image</div>}
        <div className="adm-image__actions">
          <input ref={input} id={id} type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={pick} hidden />
          <button type="button" className="adm-btn" onClick={() => input.current.click()} disabled={state.busy}>
            {state.busy ? 'Uploading…' : value ? 'Replace image' : 'Upload image'}
          </button>
          {value && <button type="button" className="adm-btn adm-btn--quiet" onClick={() => onChange('')}>Remove</button>}
          <p className="adm-help">JPG, PNG, WebP or GIF, up to 5 MB.</p>
          {state.error && <p className="adm-error" role="alert">{state.error}</p>}
        </div>
      </div>
    </div>
  );
}

/** Several photos: upload many at once, reorder, remove. The first is the cover. */
function ImagesField({ id, label, value, onChange }) {
  const input = useRef(null);
  const list = Array.isArray(value) ? value : [];
  const [state, setState] = useState({ busy: false, done: 0, total: 0, error: '' });
  async function pick(e) {
    const files = [...(e.target.files || [])];
    e.target.value = '';
    if (!files.length) return;
    const tooBig = files.filter((f) => f.size > 5 * 1024 * 1024);
    const ok = files.filter((f) => f.size <= 5 * 1024 * 1024);
    setState({ busy: true, done: 0, total: ok.length, error: tooBig.length ? `${tooBig.length} file(s) over 5 MB were skipped.` : '' });
    const urls = [];
    for (const f of ok) {
      try { const { url } = await uploadImage(f); urls.push(url); }
      catch (err) { setState((s) => ({ ...s, error: `${f.name}: ${err.message}` })); }
      setState((s) => ({ ...s, done: s.done + 1 }));
    }
    onChange([...list, ...urls]);
    setState((s) => ({ ...s, busy: false }));
  }
  const move = (i, d) => { const c = [...list]; [c[i], c[i + d]] = [c[i + d], c[i]]; onChange(c); };
  return (
    <div className="adm-field">
      <label htmlFor={id}>{label}</label>
      <div className="adm-gallery">
        {list.map((src, i) => (
          <figure key={src + i} className="adm-gallery__item">
            <img src={src} alt="" />
            <figcaption>
              <button type="button" aria-label="Move earlier" disabled={i === 0} onClick={() => move(i, -1)}>◀</button>
              <button type="button" aria-label="Move later" disabled={i === list.length - 1} onClick={() => move(i, 1)}>▶</button>
              <button type="button" className="adm-danger-text" onClick={() => onChange(list.filter((_, j) => j !== i))}>Remove</button>
            </figcaption>
          </figure>
        ))}
        {!list.length && <div className="adm-image__ph">No photos yet</div>}
      </div>
      <input ref={input} id={id} type="file" multiple accept="image/jpeg,image/png,image/webp,image/gif" onChange={pick} hidden />
      <div className="adm-image__actions" style={{ marginTop: 10 }}>
        <button type="button" className="adm-btn" onClick={() => input.current.click()} disabled={state.busy}>
          {state.busy ? `Uploading ${state.done} of ${state.total}…` : 'Add photos'}
        </button>
        <p className="adm-help">Select several at once. JPG, PNG, WebP or GIF, up to 5 MB each. Remember to save the album.</p>
        {state.error && <p className="adm-error" role="alert">{state.error}</p>}
      </div>
    </div>
  );
}
