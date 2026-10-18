import { Link } from 'react-router-dom';
import LeafCanvas from '../components/LeafCanvas.jsx';
import Pipeline from '../components/Pipeline.jsx';
import { DisciplineTag } from '../components/ui.jsx';
import { useApi, useSite, useTitle, fmtDate } from '../lib/hooks.js';

const DISCIPLINES = [
  { cls: 'bio', name: 'Biology', text: 'Which plants, which molecules, which protein targets, and whether they work in an assay.' },
  { cls: 'chem', name: 'Chemistry', text: 'How to make those molecules cleanly, with catalysts designed for the job.' },
  { cls: 'ml', name: 'Machine learning', text: 'Models that read the literature, rank candidates and decide the next experiment.' },
];

export default function Home() {
  useTitle('');
  const { settings: s } = useSite();
  const thrusts = useApi('/thrusts');
  const news = useApi('/news?limit=3');
  const openings = useApi('/openings');

  return (
    <>
      <section className="hero">
        <div className="shell hero__grid">
          <div className="hero__copy">
            <h1 className="hero__title">{s?.heroTitle?.replace(/\*/g, '') || 'Traditional medicine, read by machines and made by catalysts'}</h1>
            <p className="hero__text">{s?.heroText}</p>
            <div className="hero__actions">
              <Link className="btn btn--saffron" to="/research">See our research</Link>
              <Link className="btn btn--ghost-light" to="/openings">Work with us</Link>
            </div>
          </div>
          <figure className="hero__figure">
            <LeafCanvas />
            <figcaption>A leaf drawn as a graph. Signals run from the stalk to the six-membered rings at the vein tips: the molecules we want to find and make.</figcaption>
          </figure>
        </div>
        <div className="shell">
          <ul className="disciplines">
            {DISCIPLINES.map((d) => (
              <li key={d.name} className={`disciplines__item disciplines__item--${d.cls}`}>
                <h2>{d.name}</h2>
                <p>{d.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {s?.pipeline?.length > 0 && (
        <section className="band">
          <div className="shell">
            <div className="band__head">
              <h2>From classical text to tested molecule</h2>
              <p>Every project runs through the same five steps, and lab results flow back into the models.</p>
            </div>
            <Pipeline steps={s.pipeline} />
          </div>
        </section>
      )}

      <section className="band band--paper">
        <div className="shell">
          <div className="band__head band__head--split">
            <h2>What we work on</h2>
            <Link className="textlink" to="/research">All research and platforms</Link>
          </div>
          <div className="thrust-list">
            {(thrusts.data || []).map((t) => (
              <article key={t._id} className="thrust-row">
                <DisciplineTag tag={t.tag} />
                <h3>{t.title}</h3>
                <p>{t.summary}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="band">
        <div className="shell twocol">
          <div>
            <div className="band__head band__head--split">
              <h2>Latest</h2>
              <Link className="textlink" to="/news">All news and events</Link>
            </div>
            <ul className="newsbrief">
              {(news.data || []).slice(0, 3).map((n) => (
                <li key={n._id}>
                  <time dateTime={n.date}>{fmtDate(n.date)}</time>
                  <Link to={`/news/${n._id}`}>{n.title}</Link>
                  <span className="newsbrief__kind">{n.kind}</span>
                </li>
              ))}
              {news.data && !news.data.length && <li className="state">News will appear here.</li>}
            </ul>
          </div>
          <aside className="openings-card">
            <h2>Open positions</h2>
            {openings.data?.length ? (
              <ul>
                {openings.data.slice(0, 4).map((o) => (
                  <li key={o._id}>
                    <span className="openings-card__type">{o.type}</span>
                    <span>{o.title}</span>
                    {o.deadline && <span className="openings-card__date">Apply by {fmtDate(o.deadline)}</span>}
                  </li>
                ))}
              </ul>
            ) : <p>No positions are open right now. You can still write to us about a PhD or internship.</p>}
            <Link className="btn btn--forest" to="/openings">View openings</Link>
          </aside>
        </div>
      </section>

      <section className="joinband">
        <div className="shell joinband__inner">
          <p className="joinband__line">Trained in one of the three fields? You will learn the other two here.</p>
          <Link className="btn btn--forest" to="/contact">Get in touch</Link>
        </div>
      </section>
    </>
  );
}
