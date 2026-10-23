import { useCallback, useEffect, useState, createContext, useContext } from 'react';
import { api } from './api.js';

/** Load JSON from the API. Returns { data, error, loading, reload }. */
export function useApi(path, { auth = false } = {}) {
  const [state, setState] = useState({ data: null, error: null, loading: true });
  const load = useCallback(() => {
    let alive = true;
    setState((s) => ({ ...s, loading: true, error: null }));
    api(path, { auth })
      .then((data) => alive && setState({ data, error: null, loading: false }))
      .catch((error) => alive && setState({ data: null, error, loading: false }));
    return () => { alive = false; };
  }, [path, auth]);
  useEffect(() => load(), [load]);
  return { ...state, reload: load };
}

export const SiteContext = createContext({ settings: null, reload: () => {} });
export const useSite = () => useContext(SiteContext);

export function useTitle(title) {
  const { settings } = useSite();
  useEffect(() => {
    const short = settings?.shortName || 'CMTMC';
    document.title = title ? `${title} | ${short}` : `${short} | ${settings?.name || 'Center for ML-Driven Traditional Medicine and Catalysis'}`;
  }, [title, settings]);
}

export const fmtDate = (d, opts = { day: 'numeric', month: 'short', year: 'numeric' }) => {
  if (!d) return '';
  const t = new Date(d);
  return isNaN(t) ? '' : t.toLocaleDateString('en-IN', opts);
};
