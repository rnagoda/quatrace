import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import HomePage from './HomePage.jsx';
import { useAuthStore } from '../store/useAuthStore.js';

vi.mock('../services/health.js', () => ({
  getHealth: vi.fn(() => Promise.resolve({ status: 'ok', db: 'ok' })),
}));
vi.mock('../services/auth.js', () => ({ logout: vi.fn(() => Promise.resolve()) }));

function renderHome() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('HomePage', () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: { first_name: 'Ada', last_name: 'Lovelace', role: 'tester' },
      isAuthenticated: true,
      status: 'authenticated',
    });
  });

  it('should render the app heading', () => {
    renderHome();
    expect(screen.getByRole('heading', { name: /quatrace/i })).toBeInTheDocument();
  });

  it('should show the signed-in user', () => {
    renderHome();
    expect(screen.getByTestId('current-user')).toHaveTextContent('Ada Lovelace');
  });

  it('should show the API status once the health query resolves', async () => {
    renderHome();
    await waitFor(() => expect(screen.getByTestId('api-status')).toHaveTextContent('ok'));
  });
});
