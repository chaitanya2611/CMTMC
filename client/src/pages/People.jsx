import { useState } from 'react';
import { PageHead, Avatar, Loading, ErrorNote, Empty, Modal, Paragraphs } from '../components/ui.jsx';
import { useApi } from '../lib/hooks.js';

const ORDER = ['Faculty', 'Scientists & postdocs', 'PhD students', 'MTech & MSc students', 'Undergraduate researchers', 'Project staff'];

function Person({ p, onOpen }) {
  return (
    <li>
      <button type="button" className="person" onClick={() => onOpen(p)} aria-haspopup="dialog">
        <span className="person__img"><Avatar name={p.name} src={p.photo} /></span>
        <span>
          <span className="person__name">{p.name}</span><br />
          {p.role && <span className="person__role">{p.role}</span>}
        </span>
      </button>
    </li>
  );
}

function Bio({ p }) {
  return (
    <div className="bio">
      <Avatar name={p.name} src={p.photo} size="xl" />
      <div>
        <h2>{p.name}</h2>
        {p.role && <p className="bio__role">{p.role}</p>}
        {p.group === 'Alumni' && p.currentPosition && <p className="bio__role">Current position: {p.currentPosition}</p>}
        {p.bio && <div className="bio__text"><Paragraphs text={p.bio} /></div>}
        {p.interests?.length > 0 && <ul className="keywords" aria-label="Research interests">{p.interests.map((k) => <li key={k}>{k}</li>)}</ul>}
        {(p.email || p.profileLink || p.scholarLink) && (
          <p className="bio__links">
            {p.email && <a className="btn btn--primary" href={`mailto:${p.email}`}>Email</a>}
            {p.profileLink && <a className="btn btn--line" href={p.profileLink} target="_blank" rel="noreferrer">Profile</a>}
            {p.scholarLink && <a className="btn btn--line" href={p.scholarLink} target="_blank" rel="noreferrer">Google Scholar</a>}
          </p>
        )}
      </div>
    </div>
  );
}

export default function People() {
  const { data, error, loading, reload } = useApi('/people');
  const [open, setOpen] = useState(null);
  const groups = ORDER.map((g) => [g, (data || []).filter((p) => p.group === g)]).filter(([, list]) => list.length);
  const alumni = (data || []).filter((p) => p.group === 'Alumni');

  return (
    <>
      <PageHead kicker="People" title="People" intro="Faculty, researchers and students working across chemistry, biology and machine learning." />
      <section className="band">
        <div className="shell">
          {loading && <Loading />}
          {error && <ErrorNote error={error} onRetry={reload} />}
          {data && !data.length && <Empty>Team members will be listed here soon.</Empty>}
          {groups.map(([g, list]) => (
            <section key={g} className="people-group" aria-labelledby={`g-${g}`}>
              <h2 id={`g-${g}`}>{g} <small>{list.length}</small></h2>
              <ul className={`portraits${g === 'Faculty' ? ' portraits--lead' : ''}`}>
                {list.map((p) => <Person key={p._id} p={p} onOpen={setOpen} />)}
              </ul>
            </section>
          ))}
        </div>
      </section>

      {alumni.length > 0 && (
        <section className="band band--tint">
          <div className="shell">
            <div className="band__head"><h2>Former members</h2></div>
            <ul className="alumni">
              {alumni.map((p) => (
                <li key={p._id}>
                  <button type="button" className="alum" onClick={() => setOpen(p)} aria-haspopup="dialog">
                    <Avatar name={p.name} src={p.photo} size="sm" />
                    <span className="alum__name">{p.name}</span>
                    <span className="alum__now">{p.currentPosition}</span>
                    <span className="alum__was">{p.role}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <Modal open={Boolean(open)} onClose={() => setOpen(null)} label={open ? `Profile of ${open.name}` : 'Profile'}>
        {open && <Bio p={open} />}
      </Modal>
    </>
  );
}
