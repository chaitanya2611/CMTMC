import { Link } from 'react-router-dom';
import HelixFigure from '../components/HelixFigure.jsx';
import Pipeline from '../components/Pipeline.jsx';
import { DisciplineTag, Avatar, TAG_CLASS } from '../components/ui.jsx';
import { useApi, useSite, useTitle, fmtDate } from '../lib/hooks.js';

const DISCIPLINES = [
  { cls: 'bio', tag: 'Biology', name: 'Targets & validation', text: 'Which plants, which molecules, which protein targets, and whether they really work in an assay.',
    icon: <svg viewBox="0 0 56 56" aria-hidden="true"><path d="M16 4C16 20 40 20 40 28S16 36 16 52M40 4C40 20 16 20 16 28S40 36 40 52" fill="none" stroke="#14B8A6" strokeWidth="3" /><path d="M19 12H37M21 44H35M18 28H38" stroke="#14B8A6" strokeOpacity=".5" strokeWidth="2" /></svg> },
  { cls: 'chem', tag: 'Chemistry', name: 'Molecules & catalysts', text: 'How to make those molecules cleanly, with catalysts designed for the job.',
    icon: <svg viewBox="0 0 56 56" aria-hidden="true"><polygon points="28,6 46,16.5 46,37.5 28,48 10,37.5 10,16.5" fill="none" stroke="#C9821A" strokeWidth="3" /><circle cx="28" cy="27" r="10" fill="none" stroke="#C9821A" strokeWidth="2" strokeDasharray="3 4" /><path d="M46 16.5L54 12" stroke="#C9821A" strokeWidth="3" /></svg> },
  { cls: 'ml', tag: 'AI/ML', name: 'Models & data', text: 'Models that read the literature, rank candidates and decide the next experiment.',
    icon: <svg viewBox="0 0 56 56" aria-hidden="true"><path stroke="#6B5BE8" strokeOpacity=".5" strokeWidth="1.5" d="M10 14L28 10M10 14L28 28M10 14L28 46M10 42L28 10M10 42L28 28M10 42L28 46M28 10L46 20M28 28L46 20M28 46L46 20M28 10L46 38M28 28L46 38M28 46L46 38" /><g fill="#fff" stroke="#6B5BE8" strokeWidth="2.5"><circle cx="10" cy="14" r="4" /><circle cx="10" cy="42" r="4" /><circle cx="28" cy="10" r="4" /><circle cx="28" cy="28" r="4" /><circle cx="28" cy="46" r="4" /><circle cx="46" cy="20" r="4" /><circle cx="46" cy="38" r="4" /></g></svg> },
];

const TICKER = ['COc1cc(/C=C/C(=O)CC(=O)/C=C/c2ccc(O)c(OC)c2)ccc1O', 'ATGGCCAAGCTGACCGAGTTC…', 'pIC50 = 7.2', 'epoch 120 · loss 0.0213 ↓', 'AKT1 · PD-L1 · FXR', 'C–H activation · Pd(II)', 'GNN · diffusion · docking', 'Withania somnifera · Curcuma longa'];

export default function Home() {
  useTitle('');
  const { settings: s } = useSite();
  const thrusts = useApi('/thrusts');
  const people = useApi('/people');
  const news = useApi('/news?limit=3');
  const openings = useApi('/openings');
  const faculty = (people.data || []).filter((p) => p.group === 'Faculty' && !/^\[/.test(p.name)).slice(0, 6);

  return (
    <>
      <section className="hero">
        <video className="hero__video" autoPlay muted loop playsInline poster="/bg/bg-hero.jpg" aria-hidden="true" tabIndex={-1}>
          <source src="/bg/hero-loop.mp4" type="video/mp4" />
        </video>
        <div className="shell hero__grid">
          <div className="hero__copy">
            <div className="hero__tags"><DisciplineTag tag="Biology" /><DisciplineTag tag="Chemistry" /><DisciplineTag tag="AI/ML" /></div>
            <h1 className="hero__title">
              {s?.heroTitle && !/read by machines/i.test(s.heroTitle)
                ? s.heroTitle.replace(/\*/g, '')
                : <>From genes and molecules to <em>models</em> that discover drugs</>}
            </h1>
            <p className="hero__text">{s?.heroText}</p>
            <div className="hero__actions">
              <Link className="btn btn--teal" to="/research">Explore research</Link>
              <Link className="btn btn--ghost-light" to="/people">Meet the team</Link>
            </div>
          </div>
          <figure className="hero__figure"><HelixFigure /></figure>
        </div>
        <div className="hero__ticker" aria-hidden="true">
          <div className="hero__ticker-track">{[...TICKER, ...TICKER].map((t, i) => <span key={i}>{t}</span>)}</div>
        </div>
      </section>

      <section className="band bg-lattice">
        <div className="shell">
          <div className="band__head">
            <p className="kicker">Three disciplines, one pipeline</p>
            <h2>Biology asks the question. Chemistry builds the answer. AI connects them.</h2>
          </div>
          <ul className="disciplines">
            {DISCIPLINES.map((d) => (
              <li key={d.cls} className={`disc disc--${d.cls}`}>
                {d.icon}
                <DisciplineTag tag={d.tag} />
                <h3>{d.name}</h3>
                <p>{d.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {s?.pipeline?.length > 0 && (
        <section className="band band--white">
          <div className="shell">
            <div className="band__head">
              <p className="kicker">How a project runs</p>
              <h2>From classical text to tested molecule</h2>
              <p>Every project runs through the same steps, and lab results flow back into the models.</p>
            </div>
            <Pipeline steps={s.pipeline} />
          </div>
        </section>
      )}

      <section className="band bg-cells is-dark">
        <div className="shell">
          <div className="band__head band__head--split">
            <div><p className="kicker">Research</p><h2>What we work on</h2></div>
            <Link className="textlink" to="/research">All research and platforms →</Link>
          </div>
          <div className="cards">
            {(thrusts.data || []).map((t) => (
              <Link key={t._id} to={`/research/${t._id}`} className="rcard">
                {t.image ? <img className="rcard__img" src={t.image} alt="" loading="lazy" /> : <div className={`rcard__art rcard__art--${TAG_CLASS[t.tag] || 'bio'}`} aria-hidden="true" />}
                <div className="rcard__body">
                  <DisciplineTag tag={t.tag} />
                  <h3>{t.title}</h3>
                  <p>{t.summary}</p>
                  <span className="rcard__more">Read more →</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {faculty.length > 0 && (
        <section className="band bg-network is-dark">
          <div className="shell">
            <div className="band__head band__head--split">
              <div><p className="kicker">People</p><h2>The team behind the pipeline</h2></div>
              <Link className="textlink" to="/people">Meet everyone →</Link>
            </div>
            <div className="facestrip">
              {faculty.map((p) => (
                <Link key={p._id} to="/people" className="face">
                  <span className="face__ring"><Avatar name={p.name} src={p.photo} size="md" /></span>
                  <span className="face__name">{p.name}</span>
                  <span className="face__role">{p.role}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="band bg-lattice">
        <div className="shell twocol">
          <div>
            <div className="band__head band__head--split">
              <div><p className="kicker">Latest</p><h2>News &amp; events</h2></div>
              <Link className="textlink" to="/news">All news →</Link>
            </div>
            <ul className="newsbrief">
              {(news.data || []).slice(0, 3).map((n) => (
                <li key={n._id}>
                  <time className="newsbrief__date" dateTime={n.date}>{fmtDate(n.date, { day: 'numeric' })}<small>{fmtDate(n.date, { month: 'short' }).toUpperCase()}</small></time>
                  <div><span className="newsbrief__kind">{n.kind}</span><br /><Link to={`/news/${n._id}`}>{n.title}</Link></div>
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
