import { createContext, useContext, useEffect, useState } from 'react';
import api from '../api';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(!!localStorage.getItem('grodart_token'));

  useEffect(() => {
    if (!localStorage.getItem('grodart_token')) return;
    api.get('/auth/me')
      .then((r) => setUser(r.data.user))
      .catch(() => localStorage.removeItem('grodart_token'))
      .finally(() => setLoading(false));
  }, []);

  const login = (token, u) => { localStorage.setItem('grodart_token', token); setUser(u); };
  const logout = () => { localStorage.removeItem('grodart_token'); setUser(null); };

  return <AuthContext.Provider value={{ user, loading, login, logout, updateUser: setUser }}>{children}</AuthContext.Provider>;
}
