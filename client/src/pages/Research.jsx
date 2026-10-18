import { PageHead, Paragraphs, DisciplineTag, ExternalLink, Loading, ErrorNote, Empty } from '../components/ui.jsx';
import { useApi } from '../lib/hooks.js';

export default function Research() {
  const thrusts = useApi('/thrusts');
  const platforms = useApi('/platforms');
  return (
    <>
      <PageHead title="Research" intro="Four connected programmes. The tag shows the lead discipline; every programme draws on all three." />
      <section className="band band--paper">
        <div className="shell">
          {thrusts.loading && <Loading />}
          {thrusts.error && <ErrorNote error={thrusts.error} onRetry={thrusts.reload} />}
          {thrusts.data && !thrusts.data.length && <Empty>Research programmes will be listed here soon.</Empty>}
          <div className="programmes">
            {(thrusts.data || []).map((t) => (
              <article key={t._id} className="programme">
                {t.image && <img className="programme__img" src={t.image} alt="" loading="lazy" />}
                <div className="programme__body">
                  <DisciplineTag tag={t.tag} />
                  <h2>{t.title}</h2>
                  <p className="programme__summary">{t.summary}</p>
                  <div className="prose"><Paragraphs text={t.details} /></div>
                  {t.keywords?.length > 0 && (
                    <ul className="keywords">{t.keywords.map((k) => <li key={k}>{k}</li>)}</ul>
                  )}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {platforms.data?.length > 0 && (
        <section className="band">
          <div className="shell">
            <div className="band__head">
              <h2>Platforms</h2>
              <p>Databases, models and tools we build and share.</p>
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
