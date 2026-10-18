import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { api, tokenStore, setUnauthorizedHandler } from './api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [checking, setChecking] = useState(true);

  const logout = useCallback(() => { tokenStore.clear(); setAdmin(null); }, []);

  useEffect(() => {
    setUnauthorizedHandler(logout);
    if (!tokenStore.get()) { setChecking(false); return; }
    api('/auth/me', { auth: true })
      .then((me) => setAdmin(me))
      .catch(() => tokenStore.clear())
      .finally(() => setChecking(false));
  }, [logout]);

  const login = async (email, password) => {
    const { token, email: e } = await api('/auth/login', { method: 'POST', body: { email, password } });
    tokenStore.set(token);
    setAdmin({ email: e });
  };

  return <AuthContext.Provider value={{ admin, checking, login, logout }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
