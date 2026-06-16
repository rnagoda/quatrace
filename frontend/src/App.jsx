import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import RequireAuth from './components/RequireAuth.jsx';
import { useAuthStore } from './store/useAuthStore.js';
import { restoreSession } from './services/auth.js';

export default function App() {
  const status = useAuthStore((s) => s.status);
  const setSession = useAuthStore((s) => s.setSession);
  const clearSession = useAuthStore((s) => s.clearSession);

  // On load, exchange the refresh cookie for a session (silent login).
  useEffect(() => {
    let active = true;
    restoreSession()
      .then((data) => {
        if (!active) return;
        if (data?.user) setSession(data.user);
        else clearSession();
      })
      .catch(() => active && clearSession());
    return () => {
      active = false;
    };
  }, [setSession, clearSession]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-500">Loading…</div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/"
        element={
          <RequireAuth>
            <HomePage />
          </RequireAuth>
        }
      />
    </Routes>
  );
}
