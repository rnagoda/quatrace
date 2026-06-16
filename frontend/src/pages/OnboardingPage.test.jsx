import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import OnboardingPage from './OnboardingPage.jsx';
import { useAuthStore } from '../store/useAuthStore.js';

vi.mock('../services/onboarding.js', () => ({
  completeOnboarding: vi.fn(() =>
    Promise.resolve({
      team: [{ id: 'n1', first_name: 'Maya', last_name: 'Chen', npc_persona: 'product_owner' }],
    }),
  ),
}));
vi.mock('../services/auth.js', () => ({
  getMe: vi.fn(() => Promise.resolve({ id: 'u1', onboarded_at: 'now' })),
}));
import { completeOnboarding } from '../services/onboarding.js';

function renderPage() {
  useAuthStore.setState({
    user: { id: 'u1', onboarded_at: null },
    isAuthenticated: true,
    status: 'authenticated',
  });
  return render(
    <MemoryRouter>
      <OnboardingPage />
    </MemoryRouter>,
  );
}

describe('OnboardingPage', () => {
  beforeEach(() => vi.clearAllMocks());

  it('should walk from project type through role to the provisioned team', async () => {
    renderPage();

    expect(screen.getByRole('heading', { name: /welcome to quatrace/i })).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText(/web application/i));
    fireEvent.click(screen.getByRole('button', { name: /continue/i }));

    expect(await screen.findByRole('heading', { name: /your role/i })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /set up my workspace/i }));

    await waitFor(() =>
      expect(completeOnboarding).toHaveBeenCalledWith({ project_type: 'web' }),
    );
    expect(await screen.findByTestId('team-list')).toHaveTextContent('Maya Chen');
  });
});
