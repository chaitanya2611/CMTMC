import { PageHead, Avatar, Loading, ErrorNote, Empty } from '../components/ui.jsx';
import { useApi } from '../lib/hooks.js';

const ORDER = ['Faculty', 'Scientists & postdocs', 'PhD students', 'MTech & MSc students', 'Undergraduate researchers', 'Project staff', 'Alumni'];

export default function People() {
  const { data, error, loading, reload } = useApi('/people');
  const groups = ORDER.map((g) => [g, (data || []).filter((p) => p.group === g)]).filter(([, list]) => list.length);
  return (
    <>
      <PageHead title="People" intro="Chemists, biologists and machine-learning researchers working on shared problems." />
      <section className="band band--paper">
        <div className="shell">
          {loading && <Loading />}
          {error && <ErrorNote error={error} onRetry={reload} />}
          {data && !data.length && <Empty>Team members will be listed here soon.</Empty>}
          {groups.map(([g, list]) => (
            <section key={g} className="people-group">
              <h2>{g}</h2>
              <ul className="people">
                {list.map((p) => (
                  <li key={p._id} className={`person${g === 'Faculty' ? ' person--lead' : ''}`}>
                    <Avatar name={p.name} src={p.photo} size={g === 'Faculty' ? 'lg' : 'md'} />
                    <div className="person__text">
                      <h3>{p.name}</h3>
                      <p className="person__role">{p.role}</p>
                      {p.bio && <p className="person__bio">{p.bio}</p>}
                      {p.interests?.length > 0 && <p className="person__int">{p.interests.join(', ')}</p>}
                      <p className="person__links">
                        {p.email && <a href={`mailto:${p.email}`}>Email</a>}
                        {p.profileLink && <a href={p.profileLink} target="_blank" rel="noreferrer">Profile</a>}
                        {p.scholarLink && <a href={p.scholarLink} target="_blank" rel="noreferrer">Google Scholar</a>}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </section>
    </>
  );
}
