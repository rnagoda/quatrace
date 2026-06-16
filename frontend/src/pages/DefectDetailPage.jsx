import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getDefect, transitionDefect, addComment } from '../services/defects.js';
import { getProject } from '../services/projects.js';
import { humanize } from '../utils/format.js';

export default function DefectDetailPage() {
  const { id, defectId } = useParams();
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');

  const projectQuery = useQuery({ queryKey: ['project', id], queryFn: () => getProject(id) });
  const defectQuery = useQuery({
    queryKey: ['defect', id, defectId],
    queryFn: () => getDefect(id, defectId),
    retry: false,
  });

  const isMember = projectQuery.data?.is_member;
  const defect = defectQuery.data;

  async function handleTransition(status) {
    setError('');
    try {
      await transitionDefect(id, defectId, status);
      defectQuery.refetch();
    } catch (err) {
      setError(err.message || 'Could not change the status.');
    }
  }

  async function handleComment(event) {
    event.preventDefault();
    setError('');
    try {
      await addComment(id, defectId, comment);
      setComment('');
      defectQuery.refetch();
    } catch (err) {
      setError(err.message || 'Could not add the comment.');
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-2xl">
        {defectQuery.isLoading && <p className="text-slate-500">Loading…</p>}
        {(defectQuery.isError || (!defectQuery.isLoading && !defect)) && (
          <p role="alert" className="text-red-700">
            Defect not found.
          </p>
        )}

        {defect && (
          <>
            <h1 className="text-2xl font-semibold text-slate-900">{defect.title}</h1>
            <p className="mt-2 text-slate-600">
              <span data-testid="defect-status">{humanize(defect.status)}</span> ·{' '}
              {humanize(defect.severity)} · {defect.priority.toUpperCase()}
            </p>
            {defect.description && <p className="mt-3 text-slate-700">{defect.description}</p>}
            <p className="mt-3 text-sm text-slate-500">
              Reporter: {defect.reporter_first_name} {defect.reporter_last_name}
              {defect.assignee_first_name &&
                ` · Assignee: ${defect.assignee_first_name} ${defect.assignee_last_name}`}
            </p>

            {error && (
              <p role="alert" className="mt-3 text-sm text-red-700">
                {error}
              </p>
            )}

            {isMember && defect.allowed_transitions?.length > 0 && (
              <div className="mt-5">
                <h2 className="text-sm font-medium text-slate-700">Move to</h2>
                <div className="mt-2 flex flex-wrap gap-2">
                  {defect.allowed_transitions.map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => handleTransition(status)}
                      className="rounded border border-slate-300 px-3 py-1 text-sm font-medium text-slate-900 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-500"
                    >
                      {humanize(status)}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <h2 className="mt-8 text-lg font-semibold text-slate-900">Comments</h2>
            <ul className="mt-2 space-y-2" data-testid="comment-list">
              {defect.comments?.map((c) => (
                <li key={c.id} className="rounded border border-slate-200 px-3 py-2">
                  <p className="text-sm text-slate-500">
                    {c.author_first_name} {c.author_last_name}
                  </p>
                  <p className="text-slate-800">{c.body}</p>
                </li>
              ))}
            </ul>

            {isMember && (
              <form onSubmit={handleComment} className="mt-4">
                <label htmlFor="comment" className="block text-sm font-medium text-slate-700">
                  Add a comment
                </label>
                <textarea
                  id="comment"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="mt-1 block w-full rounded border border-slate-300 px-3 py-2"
                />
                <button
                  type="submit"
                  disabled={!comment.trim()}
                  className="mt-2 rounded bg-slate-900 px-4 py-2 font-medium text-white hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500 disabled:opacity-60"
                >
                  Comment
                </button>
              </form>
            )}
          </>
        )}

        <Link
          to={`/projects/${id}/defects`}
          className="mt-6 inline-block text-sm text-slate-600 underline"
        >
          Back to defects
        </Link>
      </div>
    </main>
  );
}
