'use client';

import { useReportWebVitals } from 'next/web-vitals';

type ReportWebVitalsCallback = Parameters<typeof useReportWebVitals>[0];
type WebVitalName = 'LCP' | 'INP' | 'CLS';

const TRACKED_WEB_VITALS = new Set<WebVitalName>(['LCP', 'INP', 'CLS']);

const postMetric: ReportWebVitalsCallback = (metric) => {
  if (!TRACKED_WEB_VITALS.has(metric.name as WebVitalName)) {
    return;
  }

  const body = JSON.stringify({
    id: metric.id,
    name: metric.name,
    value: metric.value,
    delta: metric.delta,
    rating: metric.rating,
    navigationType: metric.navigationType,
    path: window.location.pathname,
    timestamp: Date.now(),
  });

  if (navigator.sendBeacon) {
    navigator.sendBeacon('/api/monitoring/web-vitals', body);
    return;
  }

  fetch('/api/monitoring/web-vitals', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body,
    keepalive: true,
  }).catch(() => {
    // Silent fallback: web vitals collection should never break app usage.
  });
};

export function WebVitals() {
  useReportWebVitals(postMetric);
  return null;
}
