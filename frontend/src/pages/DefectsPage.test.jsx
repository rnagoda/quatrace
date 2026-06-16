import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import DefectsPage from './DefectsPage.jsx';

vi.mock('../services/defects.js', () => ({
  listDefects: vi.fn(),
  createDefect: vi.fn(() => Promise.resolve({ id: 'new' })),
}));
vi.mock('../services/projects.js', () => ({ getProject: vi.fn() }));
import { listDefects, createDefect } from '../services/defects.js';
import { getProject } from '../services/projects.js';

function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/projects/p1/defects']}>
        <Routes>
          <Route path="/projects/:id/defects" element={<DefectsPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('DefectsPage', () => {
  beforeEach(() => vi.clearAllMocks());

  it('should list defects and show the create form for a member', async () => {
    listDefects.mockResolvedValue([
      { id: 'd1', title: 'Login bug', status: 'new', severity: 'high', priority: 'p2' },
    ]);
    getProject.mockResolvedValue({ is_member: true, members: [] });

    renderPage();

    expect(await screen.findByText('Login bug')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /log a new defect/i })).toBeInTheDocument();
  });

  it('should hide the create form for a non-member', async () => {
    listDefects.mockResolvedValue([]);
    getProject.mockResolvedValue({ is_member: false, members: [] });

    renderPage();

    expect(await screen.findByTestId('defects-empty')).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: /log a new defect/i })).not.toBeInTheDocument();
  });

  it('should call createDefect when the form is submitted', async () => {
    listDefects.mockResolvedValue([]);
    getProject.mockResolvedValue({ is_member: true, members: [] });

    renderPage();
    await screen.findByRole('heading', { name: /log a new defect/i });

    fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'New bug' } });
    fireEvent.click(screen.getByRole('button', { name: /create defect/i }));

    await waitFor(() =>
      expect(createDefect).toHaveBeenCalledWith('p1', expect.objectContaining({ title: 'New bug' })),
    );
  });
});
