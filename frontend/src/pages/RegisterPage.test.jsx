import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import RegisterPage from './RegisterPage.jsx';

vi.mock('../services/auth.js', () => ({
  register: vi.fn(() =>
    Promise.resolve({ user: { id: '1', first_name: 'A', last_name: 'B', role: 'tester' } }),
  ),
}));
import { register } from '../services/auth.js';

const renderPage = () =>
  render(
    <MemoryRouter>
      <RegisterPage />
    </MemoryRouter>,
  );

describe('RegisterPage', () => {
  beforeEach(() => vi.clearAllMocks());

  it('should render all account fields with labels', () => {
    renderPage();
    expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  it('should show a validation alert and not call register when fields are missing', async () => {
    renderPage();
    fireEvent.click(screen.getByRole('button', { name: /create account/i }));
    expect(await screen.findByRole('alert')).toBeInTheDocument();
    expect(register).not.toHaveBeenCalled();
  });

  it('should call register with the form values on valid submit', async () => {
    renderPage();
    fireEvent.change(screen.getByLabelText(/first name/i), { target: { value: 'Ada' } });
    fireEvent.change(screen.getByLabelText(/last name/i), { target: { value: 'Lovelace' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'ada@b.co' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'Password123' } });
    fireEvent.click(screen.getByRole('button', { name: /create account/i }));
    await waitFor(() =>
      expect(register).toHaveBeenCalledWith({
        first_name: 'Ada',
        last_name: 'Lovelace',
        email: 'ada@b.co',
        password: 'Password123',
      }),
    );
  });
});
