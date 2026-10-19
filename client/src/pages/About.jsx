import { PageHead, Paragraphs, ExternalLink } from '../components/ui.jsx';
import Pipeline from '../components/Pipeline.jsx';
import { useSite } from '../lib/hooks.js';

export default function About() {
  const { settings: s } = useSite();
  if (!s) return <PageHead title="About the centre" />;
  return (
    <>
      <PageHead kicker="About" title="About the centre" intro={s.name} />
      <section className="band">
        <div className="shell about">
          <div className="prose prose--lead">
            <Paragraphs text={s.about} />
            <Paragraphs text={s.aboutMore} />
          </div>
          {(s.mission || s.vision) && (
            <div className="mv">
              {s.mission && <div><h2>Mission</h2><p>{s.mission}</p></div>}
              {s.vision && <div><h2>Vision</h2><p>{s.vision}</p></div>}
            </div>
          )}
        </div>
      </section>

      {s.stats?.length > 0 && (
        <section className="band band--tint">
          <div className="shell">
            <dl className="figures">
              {s.stats.map((x, i) => (
                <div key={i}><dt>{x.label}</dt><dd>{x.value}</dd></div>
              ))}
            </dl>
          </div>
        </section>
      )}

      {s.pipeline?.length > 0 && (
        <section className="band">
          <div className="shell">
            <div className="band__head"><p className="kicker">Workflow</p><h2>How a project runs</h2></div>
            <Pipeline steps={s.pipeline} />
          </div>
        </section>
      )}

      {s.partners?.length > 0 && (
        <section className="band">
          <div className="shell">
            <div className="band__head"><p className="kicker">Partners</p><h2>Partners and collaborators</h2></div>
            <ul className="partners">
              {s.partners.map((p, i) => <li key={i}><ExternalLink href={p.link}>{p.name}</ExternalLink></li>)}
            </ul>
          </div>
        </section>
      )}
    </>
  );
}
