import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { listDefects, createDefect } from '../services/defects.js';
import { getProject } from '../services/projects.js';
import { humanize } from '../utils/format.js';

const SEVERITIES = ['critical', 'high', 'medium', 'low'];
const PRIORITIES = ['p1', 'p2', 'p3', 'p4'];
const STATUSES = ['new', 'open', 'in_progress', 'in_testing', 'resolved', 'closed', 'wont_fix'];
const EMPTY_FORM = { title: '', description: '', severity: 'medium', priority: 'p3', assignee_id: '' };

export default function DefectsPage() {
  const { id } = useParams();
  const [statusFilter, setStatusFilter] = useState('');
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState('');

  const projectQuery = useQuery({ queryKey: ['project', id], queryFn: () => getProject(id) });
  const defectsQuery = useQuery({
    queryKey: ['defects', id, statusFilter],
    queryFn: () => listDefects(id, statusFilter ? { status: statusFilter } : {}),
  });

  const isMember = projectQuery.data?.is_member;
  const assignableMembers = (projectQuery.data?.members ?? []).filter((m) => m.role !== 'viewer');
  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  async function handleCreate(event) {
    event.preventDefault();
    setError('');
    try {
      const body = {
        title: form.title,
        description: form.description || undefined,
        severity: form.severity,
        priority: form.priority,
        assignee_id: form.assignee_id || undefined,
      };
      await createDefect(id, body);
      setForm(EMPTY_FORM);
      defectsQuery.refetch();
    } catch (err) {
      setError(err.message || 'Could not create the defect.');
    }
  }

  const defects = defectsQuery.data ?? [];

  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-2xl font-semibold text-slate-900">Defects</h1>

        <div className="mt-4 flex items-center gap-2">
          <label htmlFor="status-filter" className="text-sm text-slate-600">
            Filter by status
          </label>
          <select
            id="status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded border border-slate-300 px-2 py-1"
          >
            <option value="">All</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {humanize(s)}
              </option>
            ))}
          </select>
        </div>

        {defectsQuery.isLoading && <p className="mt-4 text-slate-500">Loading…</p>}
        {!defectsQuery.isLoading && defects.length === 0 && (
          <p data-testid="defects-empty" className="mt-6 text-slate-600">
            No defects yet.
          </p>
        )}

        {defects.length > 0 && (
          <ul className="mt-6 divide-y divide-slate-200 rounded-lg bg-white shadow">
            {defects.map((defect) => (
              <li key={defect.id} className="px-4 py-3">
                <Link
                  to={`/projects/${id}/defects/${defect.id}`}
                  className="font-medium text-slate-900 underline"
                >
                  {defect.title}
                </Link>
                <p className="text-sm text-slate-500">
                  {humanize(defect.status)} · {humanize(defect.severity)} ·{' '}
                  {defect.priority.toUpperCase()}
                  {defect.assignee_first_name &&
                    ` · ${defect.assignee_first_name} ${defect.assignee_last_name}`}
                </p>
              </li>
            ))}
          </ul>
        )}

        {isMember && (
          <form onSubmit={handleCreate} className="mt-8 rounded-lg bg-white p-6 shadow">
            <h2 className="text-lg font-semibold text-slate-900">Log a new defect</h2>
            {error && (
              <p role="alert" className="mt-2 text-sm text-red-700">
                {error}
              </p>
            )}
            <div className="mt-4 space-y-3">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-slate-700">
                  Title
                </label>
                <input
                  id="title"
                  value={form.title}
                  onChange={update('title')}
                  className="mt-1 block w-full rounded border border-slate-300 px-3 py-2"
                />
              </div>
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-slate-700">
                  Description
                </label>
                <textarea
                  id="description"
                  value={form.description}
                  onChange={update('description')}
                  className="mt-1 block w-full rounded border border-slate-300 px-3 py-2"
                />
              </div>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label htmlFor="severity" className="block text-sm font-medium text-slate-700">
                    Severity
                  </label>
                  <select
                    id="severity"
                    value={form.severity}
                    onChange={update('severity')}
                    className="mt-1 block w-full rounded border border-slate-300 px-3 py-2"
                  >
                    {SEVERITIES.map((s) => (
                      <option key={s} value={s}>
                        {humanize(s)}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex-1">
                  <label htmlFor="priority" className="block text-sm font-medium text-slate-700">
                    Priority
                  </label>
                  <select
                    id="priority"
                    value={form.priority}
                    onChange={update('priority')}
                    className="mt-1 block w-full rounded border border-slate-300 px-3 py-2"
                  >
                    {PRIORITIES.map((p) => (
                      <option key={p} value={p}>
                        {p.toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label htmlFor="assignee" className="block text-sm font-medium text-slate-700">
                  Assignee (optional)
                </label>
                <select
                  id="assignee"
                  value={form.assignee_id}
                  onChange={update('assignee_id')}
                  className="mt-1 block w-full rounded border border-slate-300 px-3 py-2"
                >
                  <option value="">Unassigned</option>
                  {assignableMembers.map((m) => (
                    <option key={m.user_id} value={m.user_id}>
                      {m.first_name} {m.last_name}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                disabled={!form.title}
                className="rounded bg-slate-900 px-4 py-2 font-medium text-white hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500 disabled:opacity-60"
              >
                Create defect
              </button>
            </div>
          </form>
        )}

        <Link
          to={`/projects/${id}`}
          className="mt-6 inline-block text-sm text-slate-600 underline"
        >
          Back to project
        </Link>
      </div>
    </main>
  );
}
