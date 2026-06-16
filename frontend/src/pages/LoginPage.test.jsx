import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import LoginPage from './LoginPage.jsx';

vi.mock('../services/auth.js', () => ({
  login: vi.fn(() =>
    Promise.resolve({ user: { id: '1', first_name: 'A', last_name: 'B', role: 'tester' } }),
  ),
}));
import { login } from '../services/auth.js';

const renderPage = () =>
  render(
    <MemoryRouter>
      <LoginPage />
    </MemoryRouter>,
  );

describe('LoginPage', () => {
  beforeEach(() => vi.clearAllMocks());

  it('should render email and password fields with labels', () => {
    renderPage();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  it('should show a validation alert and not call login on empty submit', async () => {
    renderPage();
    fireEvent.click(screen.getByRole('button', { name: /log in/i }));
    expect(await screen.findByRole('alert')).toBeInTheDocument();
    expect(login).not.toHaveBeenCalled();
  });

  it('should call login with the entered credentials on valid submit', async () => {
    renderPage();
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'a@b.co' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'Password123' } });
    fireEvent.click(screen.getByRole('button', { name: /log in/i }));
    await waitFor(() =>
      expect(login).toHaveBeenCalledWith({ email: 'a@b.co', password: 'Password123' }),
    );
  });
});
