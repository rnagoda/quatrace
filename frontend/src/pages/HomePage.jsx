import { useQuery } from '@tanstack/react-query';
import { getHealth } from '../services/health.js';

export default function HomePage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['health'],
    queryFn: getHealth,
    retry: false,
  });

  let status = 'checking…';
  if (isError) status = 'unavailable';
  else if (!isLoading && data) status = data.status;

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <section className="max-w-md w-full rounded-lg bg-white shadow p-8 text-center">
        <h1 className="text-2xl font-semibold text-slate-900">QuaTrace</h1>
        <p className="mt-2 text-slate-600">QA ticket tracking &amp; test management</p>
        <p className="mt-6 text-sm text-slate-500">
          API status:{' '}
          <span className="font-medium text-slate-900" data-testid="api-status">
            {status}
          </span>
        </p>
      </section>
    </main>
  );
}
