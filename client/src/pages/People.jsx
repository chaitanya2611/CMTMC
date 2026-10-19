import { useState } from 'react';
import { PageHead, Avatar, Loading, ErrorNote, Empty, Modal, Paragraphs } from '../components/ui.jsx';
import { useApi } from '../lib/hooks.js';

const ORDER = ['Faculty', 'Scientists & postdocs', 'PhD students', 'MTech & MSc students', 'Undergraduate researchers', 'Project staff'];

function Face({ p, lead, onOpen }) {
  return (
    <li>
      <button type="button" className="face" onClick={() => onOpen(p)} aria-haspopup="dialog">
        <span className="face__ring"><Avatar name={p.name} src={p.photo} size={lead ? 'lg' : 'md'} /></span>
        <span className="face__name">{p.name}</span>
        {p.role && <span className="face__role">{p.role}</span>}
        <span className="face__bio">View bio</span>
      </button>
    </li>
  );
}

function Bio({ p }) {
  return (
    <div className="bio">
      <span className="face__ring"><Avatar name={p.name} src={p.photo} size="xl" /></span>
      <div>
        <h2>{p.name}</h2>
        {p.role && <p className="bio__role">{p.role}</p>}
        {p.group === 'Alumni' && p.currentPosition && <p className="bio__role">Now: {p.currentPosition}</p>}
        <div className="bio__text">{p.bio ? <Paragraphs text={p.bio} /> : <p>A short bio will be added soon.</p>}</div>
        {p.interests?.length > 0 && <ul className="keywords">{p.interests.map((k) => <li key={k}>{k}</li>)}</ul>}
        <p className="bio__links">
          {p.email && <a className="btn btn--forest" href={`mailto:${p.email}`}>Email</a>}
          {p.profileLink && <a className="btn btn--line" href={p.profileLink} target="_blank" rel="noreferrer">Profile</a>}
          {p.scholarLink && <a className="btn btn--line" href={p.scholarLink} target="_blank" rel="noreferrer">Google Scholar</a>}
        </p>
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
      <PageHead kicker="People" title="Chemists, biologists and coders in one room" intro="Select anyone to read their bio, research interests and links." />
      <section className="band bg-network is-dark">
        <div className="shell">
          {loading && <Loading />}
          {error && <ErrorNote error={error} onRetry={reload} />}
          {data && !data.length && <Empty>Team members will be listed here soon.</Empty>}
          {groups.map(([g, list]) => (
            <section key={g} className="people-group" aria-labelledby={`g-${g}`}>
              <h2 id={`g-${g}`}>{g} <small>{list.length}</small></h2>
              <ul className={`people${g === 'Faculty' ? ' people--lead' : ''}`}>
                {list.map((p) => <Face key={p._id} p={p} lead={g === 'Faculty'} onOpen={setOpen} />)}
              </ul>
            </section>
          ))}
        </div>
      </section>

      {alumni.length > 0 && (
        <section className="band bg-cells is-dark">
          <div className="shell">
            <div className="band__head">
              <p className="kicker">Alumni</p>
              <h2>Where our people are now</h2>
            </div>
            <ul className="alumni">
              {alumni.map((p) => (
                <li key={p._id}>
                  <button type="button" className="alum" onClick={() => setOpen(p)} aria-haspopup="dialog">
                    <Avatar name={p.name} src={p.photo} size="sm" />
                    <span className="alum__text">
                      <span className="alum__name">{p.name}</span>
                      {p.currentPosition && <span className="alum__now">{p.currentPosition}</span>}
                      {p.role && <span className="alum__was">At CMTMC: {p.role}</span>}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <Modal open={Boolean(open)} onClose={() => setOpen(null)} label={open ? `About ${open.name}` : 'Bio'}>
        {open && <Bio p={open} />}
      </Modal>
    </>
  );
}
