import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { completeOnboarding } from '../services/onboarding.js';
import { getMe } from '../services/auth.js';
import { useAuthStore } from '../store/useAuthStore.js';

const PROJECT_TYPES = [
  { value: 'mobile', label: 'Mobile App (iOS / Android)' },
  { value: 'web', label: 'Web Application' },
  { value: 'api', label: 'API / Backend Service' },
  { value: 'ecommerce', label: 'E-commerce Platform' },
  { value: 'internal', label: 'Internal Tools / Dashboard' },
];

const PERSONA_LABELS = {
  product_owner: 'Product Owner',
  developer: 'Developer',
  qa_lead: 'QA Lead',
  scrum_master: 'Scrum Master',
  qa_engineer: 'QA Engineer',
};

export default function OnboardingPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const setSession = useAuthStore((s) => s.setSession);

  const [step, setStep] = useState('type');
  const [projectType, setProjectType] = useState('');
  const [team, setTeam] = useState([]);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Already onboarded learners never see the wizard.
  if (user?.onboarded_at) return <Navigate to="/" replace />;

  async function handleProvision() {
    setError('');
    setSubmitting(true);
    try {
      const result = await completeOnboarding({ project_type: projectType });
      setTeam(result.team);
      setStep('team');
    } catch (err) {
      setError(err.message || 'Onboarding failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleEnter() {
    const me = await getMe();
    setSession(me);
    navigate('/');
  }

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <section className="w-full max-w-md rounded-lg bg-white shadow p-8">
        {error && (
          <p role="alert" className="mb-4 rounded bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        {step === 'type' && (
          <>
            <h1 className="text-2xl font-semibold text-slate-900">Welcome to QuaTrace</h1>
            <p className="mt-2 text-slate-600">What kind of software is your team building?</p>
            <fieldset className="mt-6 space-y-2">
              <legend className="sr-only">Project type</legend>
              {PROJECT_TYPES.map((type) => (
                <label
                  key={type.value}
                  className="flex items-center gap-3 rounded border border-slate-200 px-3 py-2 hover:bg-slate-50"
                >
                  <input
                    type="radio"
                    name="project_type"
                    value={type.value}
                    checked={projectType === type.value}
                    onChange={() => setProjectType(type.value)}
                  />
                  <span className="text-slate-800">{type.label}</span>
                </label>
              ))}
            </fieldset>
            <button
              type="button"
              disabled={!projectType}
              onClick={() => setStep('role')}
              className="mt-6 w-full rounded bg-slate-900 px-4 py-2 font-medium text-white hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500 disabled:opacity-60"
            >
              Continue
            </button>
          </>
        )}

        {step === 'role' && (
          <>
            <h1 className="text-2xl font-semibold text-slate-900">Your role</h1>
            <p className="mt-3 text-slate-700">
              You're joining the team as a <strong>QA Engineer</strong> (Tester) — the most common
              entry point into a QA career. You'll log defects, author test cases, and run tests
              against your team's project.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setStep('type')}
                className="rounded border border-slate-300 px-4 py-2 font-medium text-slate-900 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-500"
              >
                Back
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={handleProvision}
                className="flex-1 rounded bg-slate-900 px-4 py-2 font-medium text-white hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500 disabled:opacity-60"
              >
                {submitting ? 'Setting up your workspace…' : 'Set up my workspace'}
              </button>
            </div>
          </>
        )}

        {step === 'team' && (
          <>
            <h1 className="text-2xl font-semibold text-slate-900">Meet your team</h1>
            <p className="mt-2 text-slate-600">
              These teammates will work alongside you on your project.
            </p>
            <ul className="mt-6 space-y-2" data-testid="team-list">
              {team.map((member) => (
                <li key={member.id} className="rounded border border-slate-200 px-3 py-2">
                  <span className="font-medium text-slate-900">
                    {member.first_name} {member.last_name}
                  </span>{' '}
                  <span className="text-slate-500">
                    — {PERSONA_LABELS[member.npc_persona] ?? member.npc_persona}
                  </span>
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={handleEnter}
              className="mt-6 w-full rounded bg-slate-900 px-4 py-2 font-medium text-white hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500"
            >
              Enter QuaTrace
            </button>
          </>
        )}
      </section>
    </main>
  );
}
