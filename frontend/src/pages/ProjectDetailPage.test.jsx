import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ProjectDetailPage from './ProjectDetailPage.jsx';

vi.mock('../services/projects.js', () => ({ getProject: vi.fn() }));
import { getProject } from '../services/projects.js';

function renderDetail(id = 'p1') {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[`/projects/${id}`]}>
        <Routes>
          <Route path="/projects/:id" element={<ProjectDetailPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('ProjectDetailPage', () => {
  beforeEach(() => vi.clearAllMocks());

  it('should render the project and its members', async () => {
    getProject.mockResolvedValue({
      id: 'p1',
      name: 'Checkout',
      status: 'active',
      members: [{ user_id: 'u1', first_name: 'Ada', last_name: 'Lovelace', role: 'manager' }],
    });
    renderDetail('p1');
    expect(await screen.findByRole('heading', { name: 'Checkout' })).toBeInTheDocument();
    expect(screen.getByTestId('member-list')).toHaveTextContent('Ada Lovelace');
  });

  it('should show a not-found message when the project fails to load', async () => {
    getProject.mockRejectedValue(new Error('not found'));
    renderDetail('missing');
    expect(await screen.findByRole('alert')).toHaveTextContent(/not found/i);
  });
});
