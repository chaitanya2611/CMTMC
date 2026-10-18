import { useMemo, useState } from 'react';
import { PageHead, Loading, ErrorNote, Empty, ExternalLink } from '../components/ui.jsx';
import { useApi } from '../lib/hooks.js';

export default function Publications() {
  const { data, error, loading, reload } = useApi('/publications');
  const [q, setQ] = useState('');
  const [year, setYear] = useState('');

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
      <PageHead title="Publications" intro="Papers, preprints and conference proceedings from the centre." />
      <section className="band band--paper">
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
            <section key={y} className="pubyear">
              <h2>{y}</h2>
              <ol className="publist">
                {list.map((p) => (
                  <li key={p._id} className={p.featured ? 'is-featured' : undefined}>
                    <p className="publist__title"><ExternalLink href={p.link || (p.doi ? `https://doi.org/${p.doi}` : '')}>{p.title}</ExternalLink></p>
                    {p.authors && <p className="publist__authors">{p.authors}</p>}
                    <p className="publist__venue">
                      {p.venue && <cite>{p.venue}</cite>}
                      {p.doi && <span className="publist__doi">doi:{p.doi}</span>}
                      {p.featured && <span className="publist__feat">Featured</span>}
                    </p>
                  </li>
                ))}
              </ol>
            </section>
          ))}
        </div>
      </section>
    </>
  );
}
