import { useEffect, useState } from 'react';
import { PageHead, Loading, ErrorNote, Empty, Modal, Arrow } from '../components/ui.jsx';
import { useApi, fmtDate } from '../lib/hooks.js';

function Lightbox({ album, index, onIndex, onClose }) {
  const n = album?.images?.length || 0;
  useEffect(() => {
    if (index === null) return undefined;
    const key = (e) => {
      if (e.key === 'ArrowRight') onIndex((index + 1) % n);
      if (e.key === 'ArrowLeft') onIndex((index + n - 1) % n);
    };
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  }, [index, n, onIndex]);
  return (
    <Modal open={index !== null} onClose={onClose} label={album ? `${album.title}, photo ${index + 1} of ${n}` : 'Photo'} className="modal--photo">
      {album && index !== null && (
        <>
          <div className="lightbox">
            <img src={album.images[index]} alt={`${album.title}, photo ${index + 1}`} />
            {n > 1 && <>
              <button type="button" className="lightbox__nav lightbox__nav--prev" onClick={() => onIndex((index + n - 1) % n)} aria-label="Previous photo"><Arrow dir="left" /></button>
              <button type="button" className="lightbox__nav lightbox__nav--next" onClick={() => onIndex((index + 1) % n)} aria-label="Next photo"><Arrow /></button>
            </>}
          </div>
          <p className="lightbox__cap">{album.title} · {index + 1} / {n}</p>
        </>
      )}
    </Modal>
  );
}

export default function Gallery() {
  const { data, error, loading, reload } = useApi('/albums');
  const [albumId, setAlbumId] = useState(null);
  const [index, setIndex] = useState(null);
  const albums = (data || []).filter((a) => a.images?.length);
  const album = albums.find((a) => a._id === albumId);

  return (
    <>
      <PageHead kicker="Gallery" title="Life at the centre" intro="Conferences, awards, lab days and trips. Select an album to see the photos." />
      <section className="band bg-lattice">
        <div className="shell">
          {loading && <Loading />}
          {error && <ErrorNote error={error} onRetry={reload} />}
          {data && !albums.length && <Empty>Photo albums will appear here soon.</Empty>}

          {album ? (
            <div>
              <div className="album-view__head">
                <div>
                  <p className="kicker">{album.date ? fmtDate(album.date, { month: 'long', year: 'numeric' }) : 'Album'}</p>
                  <h2>{album.title}</h2>
                  {album.description && <p style={{ marginTop: 10, color: 'var(--ink-soft)', maxWidth: '44em' }}>{album.description}</p>}
                </div>
                <button type="button" className="btn btn--line" onClick={() => setAlbumId(null)}>← All albums</button>
              </div>
              <ul className="thumbs">
                {album.images.map((src, i) => (
                  <li key={src + i}>
                    <button type="button" className="thumb" onClick={() => setIndex(i)} aria-label={`Open photo ${i + 1} of ${album.images.length}`}>
                      <img src={src} alt="" loading="lazy" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="albums">
              {albums.map((a) => (
                <button key={a._id} type="button" className="album" onClick={() => { setAlbumId(a._id); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
                  <span className="album__cover">
                    <img src={a.images[0]} alt="" loading="lazy" />
                    <span className="album__count">{a.images.length} photos</span>
                  </span>
                  <span style={{ display: 'grid', gap: 4 }}>
                    <span style={{ font: '700 var(--t-lg)/1.2 var(--display)' }}>{a.title}</span>
                    {a.date && <span className="album__meta">{fmtDate(a.date, { month: 'long', year: 'numeric' })}</span>}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </section>
      <Lightbox album={album} index={index} onIndex={setIndex} onClose={() => setIndex(null)} />
    </>
  );
}
