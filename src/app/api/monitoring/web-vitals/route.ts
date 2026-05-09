import * as Sentry from '@sentry/nextjs';
import { authOptions } from '@/lib/auth';
import prismaClient from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

type WebVitalRating = 'good' | 'needs-improvement' | 'poor';
type WebVitalName = 'LCP' | 'INP' | 'CLS';

type WebVitalPayload = {
  id?: string;
  name?: WebVitalName;
  value?: number;
  delta?: number;
  rating?: WebVitalRating;
  navigationType?: string;
  path?: string;
  timestamp?: number;
};

function isValidPayload(payload: WebVitalPayload): payload is Required<WebVitalPayload> {
  return Boolean(
    payload.id &&
    payload.name &&
    typeof payload.value === 'number' &&
    typeof payload.delta === 'number' &&
    payload.rating &&
    payload.path &&
    typeof payload.timestamp === 'number',
  );
}

export async function POST(req: Request) {
  let payload: WebVitalPayload;

  try {
    payload = (await req.json()) as WebVitalPayload;
  } catch {
    return new NextResponse(null, { status: 400 });
  }

  if (!isValidPayload(payload)) {
    return new NextResponse(null, { status: 422 });
  }

  try {
    const session = await getServerSession(authOptions);

    await prismaClient.monitoringWebVital.create({
      data: {
        metricId: payload.id,
        name: payload.name,
        value: payload.value,
        delta: payload.delta,
        rating: payload.rating,
        navigationType: payload.navigationType,
        path: payload.path,
        userAgent: req.headers.get('user-agent'),
        occurredAt: new Date(payload.timestamp),
        userId: session?.user?.id,
      },
    });
  } catch (error) {
    Sentry.captureException(error, {
      tags: {
        source: 'web-vitals',
        operation: 'persist',
      },
      extra: payload,
    });
  }

  if (payload.rating !== 'good') {
    Sentry.captureMessage(`Web Vitals ${payload.name}: ${payload.rating}`, {
      level: payload.rating === 'poor' ? 'warning' : 'info',
      tags: {
        source: 'web-vitals',
        metric: payload.name,
        rating: payload.rating,
        path: payload.path,
      },
      extra: {
        id: payload.id,
        value: payload.value,
        delta: payload.delta,
        navigationType: payload.navigationType,
        timestamp: payload.timestamp,
      },
    });
  }

  return new NextResponse(null, { status: 204 });
}
