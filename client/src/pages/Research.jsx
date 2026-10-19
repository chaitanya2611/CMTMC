import { Link } from 'react-router-dom';
import { PageHead, DisciplineTag, ExternalLink, Loading, ErrorNote, Empty } from '../components/ui.jsx';
import { useApi } from '../lib/hooks.js';
import { ThemeVisual, Workflow } from '../components/SciMedia.jsx';

export default function Research() {
  const thrusts = useApi('/thrusts');
  const platforms = useApi('/platforms');
  return (
    <>
      <PageHead kicker="Research" title="Research" intro="The centre's programmes connect traditional-medicine knowledge, computational chemistry and machine learning. Each lists its lead discipline; all draw on the others." />
      <section className="band">
        <div className="shell">
          {thrusts.loading && <Loading />}
          {thrusts.error && <ErrorNote error={thrusts.error} onRetry={thrusts.reload} />}
          {thrusts.data && !thrusts.data.length && <Empty>Research programmes will be listed here soon.</Empty>}
          {thrusts.data?.length > 0 && (
            <ol className="themes">
              {thrusts.data.map((t, i) => (
                <li key={t._id} className="theme theme--img">
                  <span className="theme__num" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                  <div>
                    <h2 className="theme__h"><Link to={`/research/${t._id}`}>{t.title}</Link></h2>
                    <DisciplineTag tag={t.tag} />
                  </div>
                  <div className="theme__desc">
                    <p>{t.summary}</p>
                    {t.keywords?.length > 0 && <ul className="keywords" style={{ marginTop: 12 }}>{t.keywords.map((k) => <li key={k}>{k}</li>)}</ul>}
                    <Link className="more" to={`/research/${t._id}`} aria-label={`Read more about ${t.title}`}>Read more</Link>
                  </div>
                  <ThemeVisual thrust={t} className="theme__img" />
                </li>
              ))}
            </ol>
          )}
        </div>
      </section>

      <section className="band band--dark">
        <div className="shell">
          <div className="band__head">
            <p className="kicker">How the programmes connect</p>
            <h2>Research workflow</h2>
          </div>
          <Workflow />
        </div>
      </section>

      {platforms.data?.length > 0 && (
        <section className="band band--white">
          <div className="shell">
            <div className="band__head">
              <p className="kicker">Resources</p>
              <h2>Platforms and tools</h2>
              <p>Databases, models and software developed at the centre.</p>
            </div>
            <div className="table-wrap">
              <table className="platforms">
                <thead><tr><th scope="col">Name</th><th scope="col">Type</th><th scope="col">Description</th><th scope="col">Status</th></tr></thead>
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
