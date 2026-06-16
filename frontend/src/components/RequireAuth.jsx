import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore.js';

// Guards protected routes: redirects to /login when the user is not authenticated.
export default function RequireAuth({ children }) {
  const status = useAuthStore((s) => s.status);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  if (status === 'loading') return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
}
