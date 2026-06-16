import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { listProjects } from '../services/projects.js';

export default function ProjectsPage() {
  const { data: projects, isLoading, isError } = useQuery({
    queryKey: ['projects'],
    queryFn: listProjects,
  });

  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-2xl font-semibold text-slate-900">Projects</h1>

        {isLoading && <p className="mt-4 text-slate-500">Loading…</p>}
        {isError && (
          <p role="alert" className="mt-4 text-red-700">
            Could not load projects.
          </p>
        )}

        {!isLoading && !isError && projects?.length === 0 && (
          <p data-testid="projects-empty" className="mt-6 text-slate-600">
            No projects yet.
          </p>
        )}

        {projects?.length > 0 && (
          <ul className="mt-6 divide-y divide-slate-200 rounded-lg bg-white shadow">
            {projects.map((project) => (
              <li key={project.id} className="flex items-center justify-between px-4 py-3">
                <Link
                  to={`/projects/${project.id}`}
                  className="font-medium text-slate-900 underline"
                >
                  {project.name}
                </Link>
                <span className="text-sm text-slate-500">{project.status}</span>
              </li>
            ))}
          </ul>
        )}

        <Link to="/" className="mt-6 inline-block text-sm text-slate-600 underline">
          Back to home
        </Link>
      </div>
    </main>
  );
}
