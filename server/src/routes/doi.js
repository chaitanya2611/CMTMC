import { config } from '../config.js';
import { requireAdmin } from '../middleware/auth.js';
import { asyncHandler, HttpError } from '../middleware/errors.js';

/** Normalise "https://doi.org/10.1021/abc", "doi:10.1021/abc" or "10.1021/abc" to "10.1021/abc". */
export function cleanDoi(input) {
  const m = String(input || '').trim().match(/10\.\d{4,9}\/\S+/i);
  return m ? m[0].replace(/[.,;]+$/, '').toLowerCase() : null;
}

/** Mounted on the publications router: GET /api/publications/doi/lookup?doi=... */
export function addDoiRoutes(r) {
  r.get('/doi/lookup', requireAdmin, asyncHandler(async (req, res) => {
    const doi = cleanDoi(req.query.doi);
    if (!doi) throw new HttpError(400, 'Enter a DOI such as 10.1021/acscatal.0c04525.');
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 10000);
    let resp;
    try {
      resp = await fetch(`https://api.crossref.org/works/${encodeURIComponent(doi)}?mailto=${encodeURIComponent(config.crossrefMailto)}`, {
        headers: { 'User-Agent': `CMTMC-website/1.0 (mailto:${config.crossrefMailto})` }, signal: ctrl.signal,
      });
    } catch {
      throw new HttpError(502, 'Could not reach Crossref. Check the server\'s internet connection and try again.');
    } finally { clearTimeout(timer); }
    if (resp.status === 404) throw new HttpError(404, 'Crossref has no record of that DOI. Check it for typos.');
    if (!resp.ok) throw new HttpError(502, `Crossref returned an error (${resp.status}). Try again later.`);
    const w = (await resp.json()).message || {};
    const year = w.issued?.['date-parts']?.[0]?.[0] || w.published?.['date-parts']?.[0]?.[0] || null;
    const authors = (w.author || []).map((a) => [a.given, a.family].filter(Boolean).join(' ') || a.name).filter(Boolean).join(', ');
    res.json({
      title: (w.title?.[0] || '').replace(/<[^>]+>/g, ''),
      authors,
      venue: w['container-title']?.[0] || w.publisher || '',
      year,
      doi,
      link: `https://doi.org/${doi}`,
    });
  }));
}
