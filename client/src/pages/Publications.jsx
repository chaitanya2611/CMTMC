import { useMemo, useState } from 'react';
import { PageHead, Loading, ErrorNote, Empty, ExternalLink, Modal } from '../components/ui.jsx';
import { useApi } from '../lib/hooks.js';

export function PubItem({ p, onZoom }) {
  const href = p.link || (p.doi ? `https://doi.org/${p.doi}` : '');
  return (
    <li className="citation">
      <div>
        <p className="citation__title"><ExternalLink href={href}>{p.title}</ExternalLink></p>
        {p.authors && <p className="citation__authors">{p.authors}</p>}
        <p className="citation__src">
          {p.venue && <cite>{p.venue}</cite>}
          {p.year && <span>{p.year}</span>}
          {p.doi && <span className="citation__doi"><a href={`https://doi.org/${p.doi}`} target="_blank" rel="noreferrer">doi:{p.doi}</a></span>}
          {p.featured && <span className="citation__feat">Featured</span>}
        </p>
      </div>
      {p.image && (
        <button type="button" className="citation__thumb" onClick={() => onZoom?.(p)} aria-label={`Enlarge graphical abstract: ${p.title}`}>
          <img src={p.image} alt="" loading="lazy" />
        </button>
      )}
    </li>
  );
}

export default function Publications() {
  const { data, error, loading, reload } = useApi('/publications');
  const [q, setQ] = useState('');
  const [year, setYear] = useState('');
  const [zoom, setZoom] = useState(null);

  const years = useMemo(() => [...new Set((data || []).map((p) => p.year).filter(Boolean))].sort((a, b) => b - a), [data]);
  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return (data || []).filter((p) => (!year || String(p.year) === year)
      && (!needle || [p.title, p.authors, p.venue].join(' ').toLowerCase().includes(needle)));
  }, [data, q, year]);
  const byYear = useMemo(() => {
    const m = new Map();
    shown.forEach((p) => { const y = p.year || 'Undated'; if (!m.has(y)) m.set(y, []); m.get(y).push(p); });
    return [...m.entries()];
  }, [shown]);

  return (
    <>
      <PageHead kicker="Publications" title="Publications" intro="Journal articles, preprints and conference papers from the centre, listed by year." />
      <section className="band">
        <div className="shell">
          <form className="filters" role="search" onSubmit={(e) => e.preventDefault()}>
            <label className="field">
              <span>Search</span>
              <input id="pub-q" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Title, author or journal" />
            </label>
            <label className="field">
              <span>Year</span>
              <select id="pub-year" value={year} onChange={(e) => setYear(e.target.value)}>
                <option value="">All years</option>
                {years.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
            </label>
            <p className="filters__count" aria-live="polite">{data ? `${shown.length} of ${data.length}` : ''}</p>
          </form>

          {loading && <Loading />}
          {error && <ErrorNote error={error} onRetry={reload} />}
          {data && !shown.length && <Empty>{data.length ? 'No publications match those filters.' : 'Publications will be listed here soon.'}</Empty>}

          {byYear.map(([y, list]) => (
            <section key={y} className="pubyear" aria-labelledby={`y-${y}`}>
              <h2 id={`y-${y}`}>{y}</h2>
              <ol className="citations">
                {list.map((p) => <PubItem key={p._id} p={p} onZoom={setZoom} />)}
              </ol>
            </section>
          ))}
        </div>
      </section>

      <Modal open={Boolean(zoom)} onClose={() => setZoom(null)} label="Graphical abstract" className="modal--photo">
        {zoom && <><img className="lightimg" src={zoom.image} alt={`Graphical abstract: ${zoom.title}`} /><p className="lightbox__cap">{zoom.title}</p></>}
      </Modal>
    </>
  );
}
