import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { getHealth } from '../services/health.js';
import { logout } from '../services/auth.js';
import { useAuthStore } from '../store/useAuthStore.js';

export default function HomePage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const clearSession = useAuthStore((s) => s.clearSession);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['health'],
    queryFn: getHealth,
    retry: false,
  });

  let status = 'checking…';
  if (isError) status = 'unavailable';
  else if (!isLoading && data) status = data.status;

  async function handleLogout() {
    try {
      await logout();
    } finally {
      clearSession();
      navigate('/login');
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <section className="max-w-md w-full rounded-lg bg-white shadow p-8 text-center">
        <h1 className="text-2xl font-semibold text-slate-900">QuaTrace</h1>
        {user && (
          <p className="mt-2 text-slate-700">
            Signed in as{' '}
            <span className="font-medium" data-testid="current-user">
              {user.first_name} {user.last_name}
            </span>{' '}
            ({user.role})
          </p>
        )}
        <p className="mt-4 text-sm text-slate-500">
          API status:{' '}
          <span className="font-medium text-slate-900" data-testid="api-status">
            {status}
          </span>
        </p>
        <button
          type="button"
          onClick={handleLogout}
          className="mt-6 rounded bg-slate-900 px-4 py-2 font-medium text-white hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500"
        >
          Log out
        </button>
      </section>
    </main>
  );
}
