import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { PageHead, Paragraphs, Loading, ErrorNote, Modal } from '../components/ui.jsx';
import { PubItem } from './Publications.jsx';
import { useApi } from '../lib/hooks.js';

export default function ResearchDetail() {
  const { id } = useParams();
  const { data: t, error, loading, reload } = useApi(`/thrusts/${id}`);
  const pubs = useApi('/publications');
  const all = useApi('/thrusts');
  const [zoom, setZoom] = useState(null);

  // Representative papers: DOIs listed on the programme, else papers whose title mentions a keyword
  const papers = useMemo(() => {
    if (!t || !pubs.data) return [];
    const dois = (t.paperDois || []).map((d) => d.toLowerCase().replace(/^https?:\/\/(dx\.)?doi\.org\//, ''));
    if (dois.length) return pubs.data.filter((p) => p.doi && dois.includes(p.doi.toLowerCase()));
    const kws = (t.keywords || []).map((k) => k.toLowerCase()).filter((k) => k.length > 3);
    return kws.length ? pubs.data.filter((p) => kws.some((k) => (p.title || '').toLowerCase().includes(k))).slice(0, 6) : [];
  }, [t, pubs.data]);
  const others = (all.data || []).filter((x) => x._id !== id);

  if (loading) return <><PageHead title="Research" /><div className="shell band"><Loading /></div></>;
  if (error || !t) return <><PageHead title="Research" /><div className="shell band"><ErrorNote error={error} onRetry={error?.status === 404 ? undefined : reload} /><Link className="textlink" to="/research">Back to all research</Link></div></>;

  return (
    <>
      <PageHead title={t.title} intro={t.summary} crumbs={[['/research', 'Research'], [null, t.title]]} />
      <section className="band">
        <div className="shell rdetail">
          <div className="prose">
            {t.image && <img className="rdetail__img" src={t.image} alt="" />}
            {t.details ? <Paragraphs text={t.details} /> : <p className="rdetail__summary">{t.summary}</p>}
          </div>
          <aside className="rdetail__side">
            <div><p className="kicker">Lead discipline</p><p>{t.tag === 'AI/ML' ? 'Machine learning' : t.tag}</p></div>
            {t.keywords?.length > 0 && <div><p className="kicker">Keywords</p><ul className="keywords">{t.keywords.map((k) => <li key={k}>{k}</li>)}</ul></div>}
            {others.length > 0 && (
              <div>
                <p className="kicker">Other programmes</p>
                <ul>
                  {others.map((o) => <li key={o._id}><Link className="textlink" to={`/research/${o._id}`}>{o.title}</Link></li>)}
                </ul>
              </div>
            )}
          </aside>
        </div>
      </section>

      {papers.length > 0 && (
        <section className="band band--white">
          <div className="shell">
            <div className="band__head"><p className="kicker">Publications</p><h2>Representative publications</h2></div>
            <ol className="citations">{papers.map((p) => <PubItem key={p._id} p={p} onZoom={setZoom} />)}</ol>
          </div>
        </section>
      )}

      <Modal open={Boolean(zoom)} onClose={() => setZoom(null)} label="Graphical abstract" className="modal--photo">
        {zoom && <><img className="lightimg" src={zoom.image} alt={`Graphical abstract: ${zoom.title}`} /><p className="lightbox__cap">{zoom.title}</p></>}
      </Modal>
    </>
  );
}
