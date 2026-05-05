import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import { Container } from './index';

describe('Container', () => {
  test('renders children inside the layout wrapper', () => {
    render(
      <Container>
        <p>Conteudo interno</p>
      </Container>,
    );

    expect(screen.getByText('Conteudo interno')).toBeInTheDocument();
  });
});
