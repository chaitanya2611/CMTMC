import { useState } from 'react';
import { PageHead } from '../components/ui.jsx';
import { useSite } from '../lib/hooks.js';
import { api } from '../lib/api.js';

const EMPTY = { name: '', email: '', subject: '', body: '', website: '' };

export default function Contact() {
  const { settings: s } = useSite();
  const [form, setForm] = useState(EMPTY);
  const [state, setState] = useState({ status: 'idle', msg: '' });
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    if (!form.name.trim() || !/^\S+@\S+\.\S+$/.test(form.email) || !form.body.trim()) {
      setState({ status: 'error', msg: 'Fill in your name, a valid email and a message.' });
      return;
    }
    setState({ status: 'sending', msg: '' });
    try {
      await api('/messages', { method: 'POST', body: form });
      setForm(EMPTY);
      setState({ status: 'sent', msg: 'Message sent. We usually reply within a week.' });
    } catch (err) {
      setState({ status: 'error', msg: err.message });
    }
  }

  return (
    <>
      <PageHead kicker="Contact" title="Contact" intro="Questions about our research, collaborations or positions. Send a message and the team will reply by email." />
      <section className="band">
        <div className="shell contact">
          <form className="contact__form" onSubmit={submit} noValidate>
            <div className="field-row">
              <label className="field"><span>Your name</span><input id="c-name" value={form.name} onChange={set('name')} autoComplete="name" required maxLength={120} /></label>
              <label className="field"><span>Email</span><input id="c-email" type="email" value={form.email} onChange={set('email')} autoComplete="email" required maxLength={200} /></label>
            </div>
            <label className="field"><span>Subject <em>(optional)</em></span><input id="c-subject" value={form.subject} onChange={set('subject')} maxLength={200} /></label>
            <label className="field"><span>Message</span><textarea id="c-body" rows={7} value={form.body} onChange={set('body')} required maxLength={5000} /></label>
            {/* Hidden from people; bots tend to fill it */}
            <label className="hp" aria-hidden="true">Website<input tabIndex={-1} autoComplete="off" value={form.website} onChange={set('website')} /></label>
            <div className="contact__submit">
              <button className="btn btn--forest" type="submit" disabled={state.status === 'sending'}>{state.status === 'sending' ? 'Sending…' : 'Send message'}</button>
              {state.msg && <p className={`formnote formnote--${state.status}`} role={state.status === 'error' ? 'alert' : 'status'}>{state.msg}</p>}
            </div>
          </form>
          <aside className="contact__info">
            {s?.email && (<div><h2>Email</h2><p><a href={`mailto:${s.email}`}>{s.email}</a></p></div>)}
            {s?.phone && (<div><h2>Phone</h2><p>{s.phone}</p></div>)}
            {s?.address && (<div><h2>Address</h2><p className="pre">{s.address}</p></div>)}
          </aside>
        </div>
      </section>
    </>
  );
}
