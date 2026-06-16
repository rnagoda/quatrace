import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ProjectsPage from './ProjectsPage.jsx';

vi.mock('../services/projects.js', () => ({ listProjects: vi.fn() }));
import { listProjects } from '../services/projects.js';

function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <ProjectsPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('ProjectsPage', () => {
  beforeEach(() => vi.clearAllMocks());

  it('should show an empty state when there are no projects', async () => {
    listProjects.mockResolvedValue([]);
    renderPage();
    expect(await screen.findByTestId('projects-empty')).toBeInTheDocument();
  });

  it('should list projects when present', async () => {
    listProjects.mockResolvedValue([{ id: '1', name: 'Checkout', status: 'active' }]);
    renderPage();
    expect(await screen.findByText('Checkout')).toBeInTheDocument();
  });
});
