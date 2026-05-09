import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { ThemeToggle } from './index';

describe('ThemeToggle', () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.classList.remove('dark');
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  test('uses saved dark theme and toggles back to light', async () => {
    window.localStorage.setItem('theme', 'dark');

    render(<ThemeToggle />);

    await waitFor(() => expect(document.documentElement).toHaveClass('dark'));

    fireEvent.click(screen.getByRole('button', { name: /ativar tema claro/i }));

    await waitFor(() => expect(document.documentElement).not.toHaveClass('dark'));
    expect(window.localStorage.getItem('theme')).toBe('light');
  });

  test('uses system preference when no theme is saved', async () => {
    vi.stubGlobal(
      'matchMedia',
      vi.fn().mockReturnValue({
        matches: true,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }),
    );

    render(<ThemeToggle />);

    await waitFor(() => expect(screen.getByRole('button', { name: /ativar tema claro/i })).toBeInTheDocument());
    expect(document.documentElement).toHaveClass('dark');
  });
});
