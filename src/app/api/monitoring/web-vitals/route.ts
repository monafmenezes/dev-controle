import * as Sentry from '@sentry/nextjs';
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
