import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import DefectDetailPage from './DefectDetailPage.jsx';

vi.mock('../services/defects.js', () => ({
  getDefect: vi.fn(),
  transitionDefect: vi.fn(() => Promise.resolve({})),
  addComment: vi.fn(() => Promise.resolve([])),
}));
vi.mock('../services/projects.js', () => ({ getProject: vi.fn() }));
import { getDefect, transitionDefect } from '../services/defects.js';
import { getProject } from '../services/projects.js';

function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/projects/p1/defects/d1']}>
        <Routes>
          <Route path="/projects/:id/defects/:defectId" element={<DefectDetailPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

const DEFECT = {
  id: 'd1',
  title: 'Login bug',
  status: 'new',
  severity: 'high',
  priority: 'p2',
  allowed_transitions: ['open'],
  comments: [{ id: 'c1', author_first_name: 'Ada', author_last_name: 'Lovelace', body: 'Repro!' }],
  reporter_first_name: 'Reed',
  reporter_last_name: 'Porter',
};

describe('DefectDetailPage', () => {
  beforeEach(() => vi.clearAllMocks());

  it('should render the defect, its status, and a comment', async () => {
    getDefect.mockResolvedValue(DEFECT);
    getProject.mockResolvedValue({ is_member: true });

    renderPage();

    expect(await screen.findByRole('heading', { name: 'Login bug' })).toBeInTheDocument();
    expect(screen.getByTestId('defect-status')).toHaveTextContent('New');
    expect(screen.getByTestId('comment-list')).toHaveTextContent('Repro!');
  });

  it('should call transitionDefect when a transition button is clicked', async () => {
    getDefect.mockResolvedValue(DEFECT);
    getProject.mockResolvedValue({ is_member: true });

    renderPage();
    const openButton = await screen.findByRole('button', { name: 'Open' });
    fireEvent.click(openButton);

    await waitFor(() => expect(transitionDefect).toHaveBeenCalledWith('p1', 'd1', 'open'));
  });

  it('should not show transition buttons for a non-member', async () => {
    getDefect.mockResolvedValue(DEFECT);
    getProject.mockResolvedValue({ is_member: false });

    renderPage();
    await screen.findByRole('heading', { name: 'Login bug' });
    expect(screen.queryByRole('button', { name: 'Open' })).not.toBeInTheDocument();
  });
});
