import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { DisciplineTag, Avatar, Paragraphs, DateBlock, ExternalLink } from '../components/ui.jsx';
import { HeroMedia, ThemeVisual, Workflow } from '../components/SciMedia.jsx';
import { useApi, useSite, useTitle, fmtDate } from '../lib/hooks.js';

const isPlaceholder = (txt) => /^\[/.test((txt || '').trim());
const pubHref = (p) => p.link || (p.doi ? `https://doi.org/${p.doi}` : '');

export default function Home() {
  useTitle('');
  const { settings: s } = useSite();
  const thrusts = useApi('/thrusts');
  const people = useApi('/people');
  const pubs = useApi('/publications');
  const news = useApi('/news?limit=4');
  const openings = useApi('/openings');

  const faculty = useMemo(() => (people.data || []).filter((p) => p.group === 'Faculty' && !isPlaceholder(p.name)), [people.data]);
  const realPubs = (pubs.data || []).filter((p) => !isPlaceholder(p.title));
  const featured = realPubs.filter((p) => p.featured).slice(0, 3);
  const recent = realPubs.slice(0, 5);
  const realNews = (news.data || []).filter((n) => !isPlaceholder(n.title));
  const name = s?.name || 'Center for Machine Learning–Driven Traditional Medicine and Catalysis';

  return (
    <>
      {/* 1. Hero: rendered molecular-modelling loop behind a dark veil */}
      <section className="hero">
        <HeroMedia />
        <div className="hero__veil" aria-hidden="true" />
        <div className="shell hero__inner">
          <div className="hero__content">
            <p className="hero__eyebrow"><span aria-hidden="true" /> IIT Bombay · Interdisciplinary research</p>
            <h1 className="hero__title">{name}</h1>
            {s?.heroText && <p className="hero__text">{s.heroText}</p>}
            <div className="hero__actions">
              <Link className="btn btn--signal" to="/research">Explore our research <span aria-hidden="true">↗</span></Link>
              <Link className="btn btn--ghost" to="/about">Discover CMTMC</Link>
            </div>
          </div>
          <aside className="hero__system" aria-label="CMTMC research domains">
            <div className="hero__orb" aria-hidden="true">
              <span className="hero__orb-core">C</span>
              <span className="hero__orb-node hero__orb-node--a" />
              <span className="hero__orb-node hero__orb-node--b" />
              <span className="hero__orb-node hero__orb-node--c" />
            </div>
            <p className="hero__system-label">One discovery engine</p>
            <ol>
              <li><span>01</span> Traditional knowledge</li>
              <li><span>02</span> Molecular intelligence</li>
              <li><span>03</span> Catalytic discovery</li>
            </ol>
          </aside>
        </div>
      </section>

      {thrusts.data?.length > 0 && (
        <section className="glance-strip" aria-label="At a glance">
          <div className="shell glance-strip__grid">
            <div className="glance">
              <p className="glance__count">{String(thrusts.data.length).padStart(2, '0')}</p>
              <h2>Connected research programmes</h2>
              <ul>{thrusts.data.map((t) => <li key={t._id}><Link to={`/research/${t._id}`}>{t.title}</Link></li>)}</ul>
            </div>
          </div>
        </section>
      )}

      {/* 2. About */}
      {(s?.about || s?.mission) && (
        <section className="band">
          <div className="shell intro">
            <div>
              <h2>Bridging ancestral knowledge and molecular intelligence.</h2>
            </div>
            <div className="intro__text">
              {s.about ? <Paragraphs text={s.about} limit={2} /> : <p>{s.mission}</p>}
              {s.aboutMore && <Paragraphs text={s.aboutMore} limit={1} />}
              <p><Link className="more" to="/about">More about the center</Link></p>
            </div>
          </div>
        </section>
      )}

      {/* Research workflow: the visual story of the center's pipeline */}
      <section className="band band--dark">
        <div className="shell">
          <div className="band__head">
            <p className="kicker">Research workflow</p>
            <h2>From traditional knowledge to tested molecules</h2>
            <p>Natural compounds are converted into molecular data, computational and machine-learning methods screen them against biological targets, and promising interactions are investigated for therapeutic discovery.</p>
          </div>
          <Workflow />
        </div>
      </section>

      {/* 3. Research */}
      {thrusts.data?.length > 0 && (
        <section className="band band--white">
          <div className="shell">
            <div className="band__head band__head--split">
              <div><p className="kicker">Research</p><h2>Research themes</h2></div>
              <Link className="more" to="/research">All research and platforms</Link>
            </div>
            <ol className="themes">
              {thrusts.data.map((t, i) => (
                <li key={t._id} className="theme theme--img">
                  <span className="theme__num" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                  <div>
                    <h3><Link to={`/research/${t._id}`}>{t.title}</Link></h3>
                    <DisciplineTag tag={t.tag} />
                  </div>
                  <div className="theme__desc">
                    <p>{t.summary}</p>
                    <Link className="more" to={`/research/${t._id}`} aria-label={`Learn more about ${t.title}`}>Learn more</Link>
                  </div>
                  <ThemeVisual thrust={t} className="theme__img" />
                </li>
              ))}
            </ol>
          </div>
        </section>
      )}

      {/* 4. Featured research: papers marked "featured" in the admin panel */}
      {featured.length > 0 && (
        <section className="band">
          <div className="shell">
            <div className="band__head"><p className="kicker">Featured research</p><h2>Selected recent work</h2></div>
            <div className="features">
              {featured.map((p) => (
                <article key={p._id} className="feature">
                  {p.image && <img className="feature__img" src={p.image} alt={`Graphical abstract: ${p.title}`} loading="lazy" />}
                  <p className="feature__venue">{[p.venue, p.year].filter(Boolean).join(' · ')}</p>
                  <h3><ExternalLink href={pubHref(p)}>{p.title}</ExternalLink></h3>
                  {p.authors && <p className="feature__authors">{p.authors}</p>}
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 5. People */}
      {faculty.length > 0 && (
        <section className="band band--tint">
          <div className="shell">
            <div className="band__head band__head--split">
              <div><p className="kicker">People</p><h2>Faculty</h2></div>
              <Link className="more" to="/people">All people</Link>
            </div>
            <ul className="portraits">
              {faculty.slice(0, 6).map((p) => (
                <li key={p._id}>
                  <Link to="/people" className="person">
                    <span className="person__img"><Avatar name={p.name} src={p.photo} /></span>
                    <span>
                      <span className="person__name">{p.name}</span><br />
                      <span className="person__role">{p.role}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* 6. Publications */}
      {recent.length > 0 && (
        <section className="band band--white">
          <div className="shell sechead">
            <div className="sechead__label">
              <p className="kicker">Publications</p>
              <h2>Recent publications</h2>
              <Link className="more" to="/publications">View all publications</Link>
            </div>
            <ol className="citations">
              {recent.map((p) => (
                <li key={p._id} className="citation citation--plain">
                  <div>
                    <p className="citation__title"><ExternalLink href={pubHref(p)}>{p.title}</ExternalLink></p>
                    {p.authors && <p className="citation__authors">{p.authors}</p>}
                    <p className="citation__src">
                      {p.venue && <cite>{p.venue}</cite>}
                      {p.year && <span>{p.year}</span>}
                      {p.doi && <span className="citation__doi">doi:{p.doi}</span>}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>
      )}

      {/* 7. News + opportunities */}
      <section className="band">
        <div className="shell twocol">
          <div>
            <div className="band__head band__head--split">
              <div><p className="kicker">News</p><h2>News and events</h2></div>
              <Link className="more" to="/news">All news</Link>
            </div>
            {realNews.length ? (
              <ul className="newsbrief">
                {realNews.slice(0, 4).map((n) => (
                  <li key={n._id}>
                    <DateBlock date={n.date} />
                    <div>
                      <span className="newsbrief__kind">{n.kind}{n.venue ? ` · ${n.venue}` : ''}</span>
                      <Link to={`/news/${n._id}`}>{n.title}</Link>
                    </div>
                  </li>
                ))}
              </ul>
            ) : <p className="state">News and events will be posted here.</p>}
          </div>
          <aside className="openings-card" aria-labelledby="home-openings">
            <h2 id="home-openings">Opportunities</h2>
            {openings.data?.length ? (
              <ul>
                {openings.data.slice(0, 4).map((o) => (
                  <li key={o._id}>
                    <span className="openings-card__type">{o.type}</span>
                    <span className="openings-card__title">{o.title}</span>
                    {o.deadline && <span className="openings-card__date">Apply by {fmtDate(o.deadline)}</span>}
                  </li>
                ))}
              </ul>
            ) : <p>There are no open positions at the moment. Enquiries about PhD, postdoctoral and internship positions are welcome.</p>}
            <Link className="btn btn--line" to="/openings">View opportunities</Link>
          </aside>
        </div>
      </section>

      {/* 8. Collaborations: only when entered in Site settings */}
      {s?.partners?.length > 0 && (
        <section className="band band--white">
          <div className="shell">
            <div className="band__head"><p className="kicker">Collaborations</p><h2>Partners and affiliations</h2></div>
            <ul className="partners">
              {s.partners.map((p, i) => <li key={i}><ExternalLink href={p.link}>{p.name}</ExternalLink></li>)}
            </ul>
          </div>
        </section>
      )}
    </>
  );
}
