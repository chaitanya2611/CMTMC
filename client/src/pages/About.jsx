import { PageHead, Paragraphs, ExternalLink } from '../components/ui.jsx';
import Pipeline from '../components/Pipeline.jsx';
import { useSite } from '../lib/hooks.js';

export default function About() {
  const { settings: s } = useSite();
  if (!s) return <PageHead title="About the center" />;
  return (
    <>
      <PageHead kicker="About" title="About the center" intro={s.name} />
      <section className="band">
        <div className="shell about">
          <div className="prose prose--lead">
            <Paragraphs text={s.about} />
            <Paragraphs text={s.aboutMore} />
          </div>
          {(s.mission || s.vision) && (
            <div className="mv">
              {s.mission && <div><h2>Our Mission</h2><p>{s.mission}</p></div>}
              {s.vision && <div><h2>Vision</h2><p>{s.vision}</p></div>}
            </div>
          )}
        </div>
      </section>

      {s.objectives?.length > 0 && (
        <section className="band band--tint">
          <div className="shell">
            <div className="band__head objectives__head">
              <h2>Objectives</h2>
            </div>
            <ol className="objectives">
              {s.objectives.map((objective, i) => (
                <li key={`${objective.title}-${i}`} className="objective">
                  <span className="objective__number" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                  <div>
                    <h3>{objective.title}</h3>
                    <p>{objective.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>
      )}

      {s.pipeline?.length > 0 && (
        <section className="band">
          <div className="shell">
            <div className="band__head"><h2>How a project runs</h2></div>
            <Pipeline steps={s.pipeline} />
          </div>
        </section>
      )}

      {s.partners?.length > 0 && (
        <section className="band">
          <div className="shell">
            <div className="band__head"><h2>Partners and collaborators</h2></div>
            <ul className="partners">
              {s.partners.map((p, i) => <li key={i}><ExternalLink href={p.link}>{p.name}</ExternalLink></li>)}
            </ul>
          </div>
        </section>
      )}
    </>
  );
}
