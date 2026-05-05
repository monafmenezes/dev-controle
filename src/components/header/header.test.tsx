import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import { Header } from './index';

describe('Header', () => {
  test('renders the brand link and dashboard navigation', () => {
    const { container } = render(<Header />);

    expect(screen.getByRole('link', { name: /dev controle/i })).toHaveAttribute('href', '/');
    expect(container.querySelector('a[href="/dashboard"]')).toBeInTheDocument();
  });
});
