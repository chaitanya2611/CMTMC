import { useState } from 'react';
import { Link } from 'react-router-dom';
import { PageHead, Loading, ErrorNote, Empty } from '../components/ui.jsx';
import { useApi, fmtDate } from '../lib/hooks.js';

const KINDS = ['All', 'News', 'Event', 'Seminar', 'Award'];

export default function News() {
  const { data, error, loading, reload } = useApi('/news');
  const [kind, setKind] = useState('All');
  const list = (data || []).filter((n) => kind === 'All' || n.kind === kind);
  const now = Date.now();

  return (
    <>
      <PageHead kicker="News" title="News and events" intro="Seminars, workshops, awards and announcements from the center." />
      <section className="band">
        <div className="shell">
          <div className="segmented" role="group" aria-label="Filter by type">
            {KINDS.map((k) => (
              <button key={k} type="button" aria-pressed={kind === k} onClick={() => setKind(k)}>{k}</button>
            ))}
          </div>
          {loading && <Loading />}
          {error && <ErrorNote error={error} onRetry={reload} />}
          {data && !list.length && <Empty>Nothing to show here yet.</Empty>}
          <ul className="newslist">
            {list.map((n) => {
              const upcoming = n.kind !== 'News' && new Date(n.date).getTime() > now;
              return (
                <li key={n._id} className="newsitem">
                  <div className="newsitem__date">
                    <span className="newsitem__day">{fmtDate(n.date, { day: 'numeric' })}</span>
                    <span>{fmtDate(n.date, { month: 'short', year: 'numeric' })}</span>
                  </div>
                  <div className="newsitem__body">
                    <p className="newsitem__meta">{n.kind}{upcoming && <span className="pill pill--saffron">Upcoming</span>}{n.venue && <span>{n.venue}</span>}</p>
                    <h2><Link to={`/news/${n._id}`}>{n.title}</Link></h2>
                    {n.text && <p>{n.text.length > 220 ? `${n.text.slice(0, 220).trim()}…` : n.text}</p>}
                  </div>
                  {n.image && <img className="newsitem__img" src={n.image} alt="" loading="lazy" />}
                </li>
              );
            })}
          </ul>
        </div>
      </section>
    </>
  );
}
