import { beforeEach, describe, expect, test, vi } from 'vitest';

const create = vi.fn();
const getServerSession = vi.fn();
const captureMessage = vi.fn();
const captureException = vi.fn();

vi.mock('@/lib/prisma', () => ({
  default: {
    monitoringWebVital: {
      create,
    },
  },
}));

vi.mock('next-auth', () => ({
  getServerSession,
}));

vi.mock('@/lib/auth', () => ({
  authOptions: {},
}));

vi.mock('@sentry/nextjs', () => ({
  captureMessage,
  captureException,
}));

async function postWebVital(body: unknown, headers?: HeadersInit) {
  const { POST } = await import('./route');

  return POST(
    new Request('http://localhost/api/monitoring/web-vitals', {
      method: 'POST',
      body: JSON.stringify(body),
      headers,
    }),
  );
}

describe('POST /api/monitoring/web-vitals', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getServerSession.mockResolvedValue({
      user: {
        id: 'user-id',
      },
    });
  });

  test('rejects invalid payloads', async () => {
    const response = await postWebVital({ name: 'LCP' });

    expect(response.status).toBe(422);
    expect(create).not.toHaveBeenCalled();
  });

  test('persists a valid metric without reporting good ratings to Sentry', async () => {
    create.mockResolvedValueOnce({});

    const response = await postWebVital(
      {
        id: 'metric-id',
        name: 'LCP',
        value: 123,
        delta: 10,
        rating: 'good',
        navigationType: 'navigate',
        path: '/dashboard',
        timestamp: 1710000000000,
      },
      { 'user-agent': 'Vitest' },
    );

    expect(response.status).toBe(204);
    expect(create).toHaveBeenCalledWith({
      data: {
        metricId: 'metric-id',
        name: 'LCP',
        value: 123,
        delta: 10,
        rating: 'good',
        navigationType: 'navigate',
        path: '/dashboard',
        userAgent: 'Vitest',
        occurredAt: new Date(1710000000000),
        userId: 'user-id',
      },
    });
    expect(captureMessage).not.toHaveBeenCalled();
  });

  test('reports non-good metrics to Sentry', async () => {
    create.mockResolvedValueOnce({});

    const response = await postWebVital({
      id: 'metric-id',
      name: 'CLS',
      value: 0.4,
      delta: 0.2,
      rating: 'poor',
      navigationType: 'reload',
      path: '/dashboard/customer',
      timestamp: 1710000000000,
    });

    expect(response.status).toBe(204);
    expect(captureMessage).toHaveBeenCalledWith(
      'Web Vitals CLS: poor',
      expect.objectContaining({
        level: 'warning',
      }),
    );
  });

  test('captures persistence errors without failing the request', async () => {
    create.mockRejectedValueOnce(new Error('database failed'));

    const response = await postWebVital({
      id: 'metric-id',
      name: 'INP',
      value: 250,
      delta: 50,
      rating: 'needs-improvement',
      navigationType: 'navigate',
      path: '/',
      timestamp: 1710000000000,
    });

    expect(response.status).toBe(204);
    expect(captureException).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        tags: {
          source: 'web-vitals',
          operation: 'persist',
        },
      }),
    );
  });
});
