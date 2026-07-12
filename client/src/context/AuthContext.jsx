import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import api from '../lib/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => window.localStorage.getItem('ck_token'));
  const [loading, setLoading] = useState(true);

  // On first load, if we have a token, validate it and fetch the current user.
  useEffect(() => {
    let cancelled = false;
    const bootstrap = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const { data } = await api.get('/auth/me');
        if (!cancelled) setUser(data.user);
      } catch {
        if (!cancelled) {
          window.localStorage.removeItem('ck_token');
          setToken(null);
          setUser(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    bootstrap();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const persistSession = useCallback((newToken, newUser) => {
    window.localStorage.setItem('ck_token', newToken);
    setToken(newToken);
    setUser(newUser);
  }, []);

  // Step 1 of registration: sends the OTP email, returns { userId }
  const register = useCallback(async ({ name, email, password, hostel }) => {
    const { data } = await api.post('/auth/register', { name, email, password, hostel });
    return data; // { message, userId }
  }, []);

  // Step 2 of registration: verifies the OTP and logs the user in
  const verifyOtp = useCallback(async ({ userId, otp }) => {
    const { data } = await api.post('/auth/verify-otp', { userId, otp });
    persistSession(data.token, data.user);
    return data;
  }, [persistSession]);

  const login = useCallback(async ({ email, password }) => {
    const { data } = await api.post('/auth/login', { email, password });
    persistSession(data.token, data.user);
    return data;
  }, [persistSession]);

  const loginWithGoogle = useCallback(async (idToken) => {
    const { data } = await api.post('/auth/google', { idToken });
    persistSession(data.token, data.user);
    return data;
  }, [persistSession]);

  const updateUser = useCallback((patch) => {
    setUser((u) => (u ? { ...u, ...patch } : u));
  }, []);

  const logout = useCallback(() => {
    window.localStorage.removeItem('ck_token');
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading, isAuthenticated: !!user, register, verifyOtp, login, loginWithGoogle, updateUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export default function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
