import { Link } from 'react-router-dom';
import { PageHead, DisciplineTag, ExternalLink, Loading, ErrorNote, Empty, TAG_CLASS } from '../components/ui.jsx';
import { useApi } from '../lib/hooks.js';

export default function Research() {
  const thrusts = useApi('/thrusts');
  const platforms = useApi('/platforms');
  return (
    <>
      <PageHead kicker="Research" title="Connected programmes across biology, chemistry and AI" intro="The tag shows each programme's lead discipline; every programme draws on all three. Select one to read more." />
      <section className="band bg-lattice">
        <div className="shell">
          {thrusts.loading && <Loading />}
          {thrusts.error && <ErrorNote error={thrusts.error} onRetry={thrusts.reload} />}
          {thrusts.data && !thrusts.data.length && <Empty>Research programmes will be listed here soon.</Empty>}
          <div className="cards">
            {(thrusts.data || []).map((t) => (
              <Link key={t._id} to={`/research/${t._id}`} className="rcard">
                {t.image ? <img className="rcard__img" src={t.image} alt="" loading="lazy" /> : <div className={`rcard__art rcard__art--${TAG_CLASS[t.tag] || 'bio'}`} aria-hidden="true" />}
                <div className="rcard__body">
                  <DisciplineTag tag={t.tag} />
                  <h2 style={{ fontSize: 'var(--t-lg)' }}>{t.title}</h2>
                  <p>{t.summary}</p>
                  <span className="rcard__more">Read more →</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {platforms.data?.length > 0 && (
        <section className="band bg-cells is-dark">
          <div className="shell">
            <div className="band__head">
              <p className="kicker">Open platforms</p>
              <h2>Tools we build, and share</h2>
              <p>Databases, models and tools developed at the centre.</p>
            </div>
            <div className="table-wrap">
              <table className="platforms">
                <thead><tr><th scope="col">Name</th><th scope="col">Type</th><th scope="col">What it does</th><th scope="col">Status</th></tr></thead>
                <tbody>
                  {platforms.data.map((p) => (
                    <tr key={p._id}>
                      <th scope="row"><ExternalLink href={p.link}>{p.name}</ExternalLink></th>
                      <td>{p.kind}</td>
                      <td>{p.text}</td>
                      <td><span className={`status status--${p.status.toLowerCase()}`}>{p.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
