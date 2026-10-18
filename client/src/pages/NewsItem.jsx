import { Link, useParams } from 'react-router-dom';
import { PageHead, Paragraphs, Loading, ErrorNote } from '../components/ui.jsx';
import { useApi, fmtDate } from '../lib/hooks.js';

export default function NewsItem() {
  const { id } = useParams();
  const { data: n, error, loading, reload } = useApi(`/news/${id}`);
  if (loading) return <><PageHead title="News & events" /><div className="shell band"><Loading /></div></>;
  if (error) return <><PageHead title="News & events" /><div className="shell band"><ErrorNote error={error} onRetry={error.status === 404 ? undefined : reload} /><Link className="textlink" to="/news">Back to all news</Link></div></>;
  return (
    <>
      <PageHead title={n.title} intro={[n.kind, fmtDate(n.date, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }), n.venue].filter(Boolean).join(', ')} />
      <article className="band band--paper">
        <div className="shell article">
          {n.image && <img className="article__img" src={n.image} alt="" />}
          <div className="prose prose--lead"><Paragraphs text={n.text} /></div>
          {n.link && <p><a className="btn btn--forest" href={n.link} target="_blank" rel="noreferrer">More details</a></p>}
          <p><Link className="textlink" to="/news">Back to all news</Link></p>
        </div>
      </article>
    </>
  );
}
