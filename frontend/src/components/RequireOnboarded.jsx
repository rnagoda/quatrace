import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore.js';

// Guards the main app: redirects unauthenticated users to /login and authenticated
// but not-yet-onboarded users to /onboarding.
export default function RequireOnboarded({ children }) {
  const status = useAuthStore((s) => s.status);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);

  if (status === 'loading') return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!user?.onboarded_at) return <Navigate to="/onboarding" replace />;
  return children;
}
