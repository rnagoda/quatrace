import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import HomePage from './HomePage.jsx';

// Mock the service layer so the component test never hits the network.
vi.mock('../services/health.js', () => ({
  getHealth: vi.fn(() => Promise.resolve({ status: 'ok', db: 'ok' })),
}));

function renderWithQuery(ui) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>,
  );
}

describe('HomePage', () => {
  it('should render the app heading when mounted', () => {
    renderWithQuery(<HomePage />);
    expect(
      screen.getByRole('heading', { name: /quatrace/i }),
    ).toBeInTheDocument();
  });

  it('should show the API status once the health query resolves', async () => {
    renderWithQuery(<HomePage />);
    await waitFor(() =>
      expect(screen.getByTestId('api-status')).toHaveTextContent('ok'),
    );
  });
});
