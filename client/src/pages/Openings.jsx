import { Link } from 'react-router-dom';
import { PageHead, Paragraphs, Loading, ErrorNote } from '../components/ui.jsx';
import { useApi, useSite, fmtDate } from '../lib/hooks.js';

export default function Openings() {
  const { settings } = useSite();
  const { data, error, loading, reload } = useApi('/openings');
  const today = new Date(); today.setHours(0, 0, 0, 0);

  return (
    <>
      <PageHead kicker="Opportunities" title="Opportunities" intro={settings?.joinText} />
      <section className="band">
        <div className="shell">
          {loading && <Loading />}
          {error && <ErrorNote error={error} onRetry={reload} />}
          {data && !data.length && (
            <div className="state">
              <p>No positions are advertised right now.</p>
              <p>We still welcome enquiries about PhDs, internships and visiting positions. <Link className="textlink" to="/contact">Write to us</Link>.</p>
            </div>
          )}
          <ul className="openings">
            {(data || []).map((o) => {
              const closesSoon = o.deadline && (new Date(o.deadline) - today) / 86400000 <= 14 && new Date(o.deadline) >= today;
              return (
                <li key={o._id} className="opening">
                  <div className="opening__side">
                    <span className="opening__type">{o.type}</span>
                    {o.deadline
                      ? <p className="opening__deadline">Apply by<br /><strong>{fmtDate(o.deadline, { day: 'numeric', month: 'long', year: 'numeric' })}</strong>{closesSoon && <span className="pill pill--saffron">Closing soon</span>}</p>
                      : <p className="opening__deadline">Open until filled</p>}
                  </div>
                  <div className="opening__body">
                    <h2>{o.title}</h2>
                    <div className="prose"><Paragraphs text={o.description} /></div>
                    {o.eligibility && (<><h3>Who can apply</h3><div className="prose"><Paragraphs text={o.eligibility} /></div></>)}
                    <p className="opening__actions">
                      {o.applyLink && <a className="btn btn--forest" href={o.applyLink} target="_blank" rel="noreferrer">Apply</a>}
                      {o.contactEmail && <span>Questions: <a href={`mailto:${o.contactEmail}`}>{o.contactEmail}</a></span>}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </section>
    </>
  );
}
