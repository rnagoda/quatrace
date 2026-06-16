import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../services/auth.js';
import { useAuthStore } from '../store/useAuthStore.js';

export default function RegisterPage() {
  const navigate = useNavigate();
  const setSession = useAuthStore((s) => s.setSession);
  const [form, setForm] = useState({ first_name: '', last_name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    if (!form.first_name || !form.last_name || !form.email || !form.password) {
      setError('Please complete every field.');
      return;
    }
    setSubmitting(true);
    try {
      const { user } = await register(form);
      setSession(user);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally {
      setSubmitting(false);
    }
  }

  const field = (id, label, type, autoComplete) => (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-slate-700">
        {label}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        autoComplete={autoComplete}
        value={form[id]}
        onChange={update(id)}
        className="mt-1 block w-full rounded border border-slate-300 px-3 py-2 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
      />
    </div>
  );

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <section className="w-full max-w-sm rounded-lg bg-white shadow p-8">
        <h1 className="text-2xl font-semibold text-slate-900">Create your QuaTrace account</h1>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit} noValidate>
          {error && (
            <p role="alert" className="rounded bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}

          {field('first_name', 'First name', 'text', 'given-name')}
          {field('last_name', 'Last name', 'text', 'family-name')}
          {field('email', 'Email', 'email', 'email')}
          {field('password', 'Password', 'password', 'new-password')}
          <p className="text-xs text-slate-500">
            At least 8 characters, including a letter and a number.
          </p>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded bg-slate-900 px-4 py-2 font-medium text-white hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500 disabled:opacity-60"
          >
            {submitting ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="mt-4 text-sm text-slate-600">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-slate-900 underline">
            Log in
          </Link>
        </p>
      </section>
    </main>
  );
}
