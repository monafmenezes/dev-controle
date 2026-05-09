import { render, screen } from '@testing-library/react';
import { FieldValues, UseFormRegister } from 'react-hook-form';
import { describe, expect, test, vi } from 'vitest';
import { Input } from './index';

function createRegisterMock() {
  return vi.fn((name: string) => ({ name, onChange: vi.fn(), onBlur: vi.fn(), ref: vi.fn() })) as unknown as
    UseFormRegister<FieldValues>;
}

describe('Input', () => {
  test('renders an input registered with react-hook-form', () => {
    const register = createRegisterMock();

    render(
      <Input
        type="email"
        placeholder="Digite seu email"
        name="email"
        register={register}
        rules={{ required: true }}
      />,
    );

    expect(screen.getByPlaceholderText(/digite seu email/i)).toHaveAttribute('type', 'email');
    expect(register).toHaveBeenCalledWith('email', { required: true });
  });

  test('shows validation error message', () => {
    const register = createRegisterMock();

    render(<Input type="text" placeholder="Nome" name="name" register={register} error="Nome obrigatório" />);

    expect(screen.getByText('Nome obrigatório')).toBeInTheDocument();
  });
});
