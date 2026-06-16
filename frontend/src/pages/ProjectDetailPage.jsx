import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getProject } from '../services/projects.js';

export default function ProjectDetailPage() {
  const { id } = useParams();
  const { data: project, isLoading, isError } = useQuery({
    queryKey: ['project', id],
    queryFn: () => getProject(id),
    retry: false,
  });

  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-2xl">
        {isLoading && <p className="text-slate-500">Loading…</p>}

        {(isError || (!isLoading && !project)) && (
          <p role="alert" className="text-red-700">
            Project not found.
          </p>
        )}

        {project && (
          <>
            <h1 className="text-2xl font-semibold text-slate-900">{project.name}</h1>
            <p className="mt-2 text-slate-600">Status: {project.status}</p>
            {project.project_type && (
              <p className="text-slate-600">Type: {project.project_type}</p>
            )}
            {project.description && <p className="mt-3 text-slate-700">{project.description}</p>}

            <h2 className="mt-6 text-lg font-semibold text-slate-900">Members</h2>
            <ul className="mt-2 space-y-1" data-testid="member-list">
              {project.members?.map((m) => (
                <li key={m.user_id} className="text-slate-700">
                  {m.first_name} {m.last_name} <span className="text-slate-500">({m.role})</span>
                </li>
              ))}
            </ul>

            <Link
              to={`/projects/${project.id}/defects`}
              className="mt-6 inline-block font-medium text-slate-900 underline"
            >
              View defects
            </Link>
          </>
        )}

        <Link to="/projects" className="mt-6 block text-sm text-slate-600 underline">
          Back to projects
        </Link>
      </div>
    </main>
  );
}
