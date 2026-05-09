import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { CardCustomer } from './index';

const mocks = vi.hoisted(() => ({
  refresh: vi.fn(),
  apiDelete: vi.fn(),
  toastSuccess: vi.fn(),
  toastError: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: mocks.refresh }),
}));

vi.mock('@/lib/api', () => ({
  api: {
    delete: mocks.apiDelete,
  },
}));

vi.mock('sonner', () => ({
  toast: {
    success: mocks.toastSuccess,
    error: mocks.toastError,
  },
}));

const customer = {
  id: 'customer-id',
  name: 'Mercado Silva',
  email: 'mercado@example.com',
  phone: '(11) 99999-9999',
  address: 'Rua Central, 123',
  userId: 'user-id',
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
};

describe('CardCustomer', () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders customer information', () => {
    render(<CardCustomer customer={customer} />);

    expect(screen.getByRole('heading', { name: /mercado silva/i })).toBeInTheDocument();
    expect(screen.getByText('mercado@example.com')).toBeInTheDocument();
    expect(screen.getByText('(11) 99999-9999')).toBeInTheDocument();
    expect(screen.getByText('Rua Central, 123')).toBeInTheDocument();
  });

  test('deletes customer and refreshes the route', async () => {
    mocks.apiDelete.mockResolvedValueOnce({});

    render(<CardCustomer customer={customer} />);
    fireEvent.click(screen.getByRole('button', { name: /deletar/i }));

    await waitFor(() => expect(mocks.apiDelete).toHaveBeenCalledWith('/customer?id=customer-id'));
    expect(mocks.toastSuccess).toHaveBeenCalledWith('Cliente removido com sucesso!');
    expect(mocks.refresh).toHaveBeenCalled();
  });

  test('shows fallback address and error toast when delete fails', async () => {
    mocks.apiDelete.mockRejectedValueOnce(new Error('delete failed'));

    render(<CardCustomer customer={{ ...customer, address: '' }} />);
    fireEvent.click(screen.getByRole('button', { name: /deletar/i }));

    expect(screen.getByText('Endereço não informado')).toBeInTheDocument();
    await waitFor(() => expect(mocks.toastError).toHaveBeenCalledWith('Não foi possível remover o cliente.'));
  });
});
