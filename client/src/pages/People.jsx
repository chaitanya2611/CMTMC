import { useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { PageHead, Avatar, Loading, ErrorNote, Empty, Modal, Paragraphs } from '../components/ui.jsx';
import { useApi } from '../lib/hooks.js';

const SECTIONS = {
  faculty: { title: 'Faculty', group: 'Faculty', empty: 'Faculty profiles will be listed here soon.' },
  'mtech-msc': { title: 'MTech–MSc Students', group: 'MTech & MSc students', empty: 'MTech and MSc student profiles will be listed here soon.' },
  phd: { title: 'PhD Students', group: 'PhD students', empty: 'PhD student profiles will be listed here soon.' },
  alumni: { title: 'Alumni', group: 'Alumni', empty: 'Alumni profiles will be listed here soon.' },
};

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
  const { section } = useParams();
  const config = SECTIONS[section];
  const { data, error, loading, reload } = useApi('/people');
  const [open, setOpen] = useState(null);

  if (!config) return <Navigate to="/people/faculty" replace />;

  const people = (data || []).filter((p) => p.group === config.group);
  const isAlumni = config.group === 'Alumni';

  return (
    <>
      <PageHead title={config.title} crumbs={[["/people/faculty", "People"], [null, config.title]]} />
      <section className="band">
        <div className="shell">
          {loading && <Loading />}
          {error && <ErrorNote error={error} onRetry={reload} />}
          {data && !people.length && <Empty>{config.empty}</Empty>}
          {!isAlumni && people.length > 0 && (
            <ul className={`portraits${config.group === 'Faculty' ? ' portraits--lead' : ''}`}>
              {people.map((p) => <Person key={p._id} p={p} onOpen={setOpen} />)}
            </ul>
          )}
          {isAlumni && people.length > 0 && (
            <ul className="alumni">
              {people.map((p) => (
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
          )}
        </div>
      </section>

      <Modal open={Boolean(open)} onClose={() => setOpen(null)} label={open ? `Profile of ${open.name}` : 'Profile'}>
        {open && <Bio p={open} />}
      </Modal>
    </>
  );
}
