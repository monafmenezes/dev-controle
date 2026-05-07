import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { Header } from './index';

const mockUseSession = vi.hoisted(() => vi.fn());

vi.mock('next-auth/react', () => ({
  signIn: vi.fn(),
  signOut: vi.fn(),
  useSession: mockUseSession,
}));

describe('Header', () => {
  beforeEach(() => {
    mockUseSession.mockReturnValue({
      data: {
        expires: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
        user: {
          id: 'user-id',
          name: 'Test User',
          email: 'test@example.com',
        },
      },
      status: 'authenticated',
    });
  });

  test('renders the brand link and dashboard navigation', () => {
    render(<Header />);

    expect(screen.getByRole('link', { name: /dev controle/i })).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: '' })).toHaveAttribute('href', '/dashboard');
  });

  test('renders the login button when unauthenticated', () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: 'unauthenticated',
    });

    render(<Header />);

    expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument();
  });

  test('renders the loading spinner when status is loading', () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: 'loading',
    });

    render(<Header />);

    expect(screen.getByRole('status', { name: /carregando sessão/i })).toBeInTheDocument();
  });
});
