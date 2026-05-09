import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { NewCustomerForm } from './index';

const mocks = vi.hoisted(() => ({
  refresh: vi.fn(),
  replace: vi.fn(),
  apiPost: vi.fn(),
  toastSuccess: vi.fn(),
  toastError: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: mocks.refresh, replace: mocks.replace }),
}));

vi.mock('@/lib/api', () => ({
  api: {
    post: mocks.apiPost,
  },
}));

vi.mock('sonner', () => ({
  toast: {
    success: mocks.toastSuccess,
    error: mocks.toastError,
  },
}));

function fillValidForm() {
  fireEvent.change(screen.getByPlaceholderText(/digite o nome do cliente/i), {
    target: { value: 'Mercado Silva' },
  });
  fireEvent.change(screen.getByPlaceholderText(/digite o email do cliente/i), {
    target: { value: 'mercado@example.com' },
  });
  fireEvent.change(screen.getByPlaceholderText(/digite o telefone do cliente/i), {
    target: { value: '(11) 99999-9999' },
  });
  fireEvent.change(screen.getByPlaceholderText(/digite o endereço/i), {
    target: { value: 'Rua Central, 123' },
  });
}

describe('NewCustomerForm', () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('creates a customer and redirects to customer dashboard', async () => {
    mocks.apiPost.mockResolvedValueOnce({});

    render(<NewCustomerForm userId="user-id" />);
    fillValidForm();
    fireEvent.click(screen.getByRole('button', { name: /salvar/i }));

    await waitFor(() =>
      expect(mocks.apiPost).toHaveBeenCalledWith('/customer', {
        name: 'Mercado Silva',
        email: 'mercado@example.com',
        phone: '(11) 99999-9999',
        address: 'Rua Central, 123',
        userId: 'user-id',
      }),
    );
    expect(mocks.toastSuccess).toHaveBeenCalledWith('Cliente cadastrado com sucesso!');
    expect(mocks.refresh).toHaveBeenCalled();
    expect(mocks.replace).toHaveBeenCalledWith('/dashboard/customer');
  });

  test('shows validation messages and does not submit invalid data', async () => {
    render(<NewCustomerForm userId="user-id" />);
    fireEvent.click(screen.getByRole('button', { name: /salvar/i }));

    expect(await screen.findByText('O campo nome é obrigatório')).toBeInTheDocument();
    expect(screen.getByText('O campo email é inválido')).toBeInTheDocument();
    expect(screen.getByText('O campo telefone deve estar no formato (XX) XXXXX-XXXX')).toBeInTheDocument();
    expect(mocks.apiPost).not.toHaveBeenCalled();
  });

  test('shows error toast when request fails', async () => {
    mocks.apiPost.mockRejectedValueOnce(new Error('create failed'));

    render(<NewCustomerForm userId="user-id" />);
    fillValidForm();
    fireEvent.click(screen.getByRole('button', { name: /salvar/i }));

    await waitFor(() => expect(mocks.toastError).toHaveBeenCalledWith('Não foi possível cadastrar o cliente.'));
    expect(mocks.replace).not.toHaveBeenCalled();
  });
});
