# Monitoring and Observability Guide

This document explains what is currently implemented for monitoring, how it works, and how to run it locally and with Docker.

## What is implemented

The project currently uses:

1. Sentry for error tracking and stack traces
2. Core Web Vitals collection for `LCP`, `INP`, and `CLS`
3. MongoDB persistence for valid web-vitals payloads

Note: `FID` is now largely superseded by `INP` in modern web-vitals monitoring.

## Architecture

### Error tracking

- `instrumentation.ts`: initializes runtime-specific Sentry setup and forwards `onRequestError` to Sentry.
- `sentry.server.config.ts`: Sentry init for Node.js runtime.
- `sentry.edge.config.ts`: Sentry init for Edge runtime.
- `instrumentation-client.ts`: Sentry init on the browser side and navigation breadcrumbs.

### Web vitals flow

1. The component `src/components/observability/web-vitals.tsx` captures web-vitals in the browser.
2. It sends metrics to `POST /api/monitoring/web-vitals`.
3. `src/app/api/monitoring/web-vitals/route.ts` validates payload.
4. Valid metrics are saved through Prisma in the `MonitoringWebVital` collection.
5. Non-`good` metrics are also forwarded to Sentry.

### Persisted fields

The `MonitoringWebVital` model stores:

- `metricId`
- `name`
- `value`
- `delta`
- `rating`
- `navigationType`
- `path`
- `userAgent`
- `occurredAt`
- `createdAt`
- `userId` when there is an authenticated session

## Required environment variables

Use `.env.example` as baseline.

```bash
SENTRY_DSN=
NEXT_PUBLIC_SENTRY_DSN=
SENTRY_ENVIRONMENT=development
NEXT_PUBLIC_SENTRY_ENVIRONMENT=development
SENTRY_TRACES_SAMPLE_RATE=0.1
NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE=0.1
SENTRY_PROFILES_SAMPLE_RATE=0.1
SENTRY_AUTH_TOKEN=
SENTRY_ORG=
SENTRY_PROJECT=
```

### Variable usage

- `SENTRY_DSN`: server/edge error reporting
- `NEXT_PUBLIC_SENTRY_DSN`: browser reporting
- `SENTRY_*_SAMPLE_RATE`: tracing/profiling sampling
- `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, `SENTRY_PROJECT`: source-map upload during build

## Local setup (without Docker)

1. Install dependencies:

```bash
npm install
```

2. Create env file:

```bash
cp .env.example .env.local
```

3. Fill Sentry values in `.env.local`.

4. Start app:

```bash
npm run dev
```

5. Open `http://localhost:3000`.

## Docker setup

The repository includes:

- `Dockerfile` (production app image)
- `docker-compose.yml` (app and optional e2e profile)
- `Dockerfile.e2e` (Playwright container)

### Prepare environment

```bash
cp .env.example .env
```

Fill Sentry values in `.env`.

### Start app

```bash
npm run docker:up
```

Open `http://localhost:3000`.

### Read logs

```bash
npm run docker:logs
```

### Stop containers

```bash
npm run docker:down
```

### Run E2E in Docker

```bash
npm run docker:e2e
```

## How to validate monitoring is working

### Validate Sentry runtime init

1. Run app with valid DSN values.
2. Trigger a server error intentionally (temporary test route) and confirm event appears in Sentry.

### Validate web-vitals flow

1. Open app in browser.
2. Check Network tab for `POST /api/monitoring/web-vitals`.
3. Confirm valid payloads are persisted in MongoDB.
4. Confirm events with `rating` `needs-improvement`/`poor` appear in Sentry messages.

## Troubleshooting

- No events in Sentry:
  - Check DSN values.
  - Confirm environment variables are loaded in the correct runtime.
- Browser events missing:
  - Ensure `NEXT_PUBLIC_SENTRY_DSN` is present at build/runtime.
- Docker app up but no telemetry:
  - Verify `.env` exists and contains Sentry values.
  - Rebuild container after env changes:
    - `npm run docker:down`
    - `npm run docker:up`

## Current limitation

- Web-vitals endpoint is public and receives client payloads without authentication.
- For production hardening, add request filtering/rate limiting before persisting or forwarding events to Sentry.
