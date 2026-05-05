# Testing Guide

This project uses two testing layers:

1. Integration tests with `Vitest` + `Testing Library`
2. End-to-end (E2E) tests with `Playwright`

## Test stack

- Integration:
  - `vitest`
  - `@testing-library/react`
  - `@testing-library/jest-dom`
  - Config: `vitest.config.mts` + `vitest.setup.ts`
- E2E:
  - `@playwright/test`
  - Config: `playwright.config.ts`
  - Docker support: `Dockerfile.e2e`

## Available commands

- `npm run test`: run Vitest in watch mode
- `npm run test:integration`: run integration tests once
- `npm run test:e2e`: run Playwright E2E locally
- `npm run test:e2e:ui`: run Playwright in UI mode
- `npm run test:e2e:docker`: build and run E2E in Docker

## Integration tests (Vitest)

### Where to create tests

- Place tests close to the component or module under test.
- Current convention: `src/**/*.test.tsx` and `src/**/*.test.ts`

Examples:

- `src/components/header/header.test.tsx`
- `src/components/container/container.test.tsx`

### Test pattern

- Use `describe` and `test`.
- Prefer user-facing assertions from Testing Library (`getByRole`, `getByText`, etc.).
- Avoid implementation-coupled selectors when possible.

Example:

```tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';

describe('ComponentName', () => {
  test('renders visible content', () => {
    render(<div>Hello</div>);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

### Run

```bash
npm run test:integration
```

## E2E tests (Playwright)

### Where to create tests

- Use `tests/e2e/*.spec.ts`
- Current example: `tests/e2e/navigation.spec.ts`

### Test pattern

- Validate user flows (navigation, form submission, permissions, critical paths).
- Use semantic locators (`getByRole`) first.
- Keep tests deterministic and independent.

Example:

```ts
import { expect, test } from '@playwright/test';

test('navigates from home to dashboard', async ({ page }) => {
  await page.goto('/');
  await page.locator('a[href="/dashboard"]').click();
  await expect(page).toHaveURL('/dashboard');
});
```

### Run locally

```bash
npm run test:e2e
```

If local browsers are missing, install them:

```bash
npx playwright install chromium
```

## Running E2E with Docker

Use Docker when you want a stable browser/runtime environment without installing Playwright browsers on your host machine.

### Prerequisites

- Docker installed and running

### Run

```bash
npm run test:e2e:docker
```

What this command does:

1. Builds image `dev-controle-e2e` using `Dockerfile.e2e`
2. Runs tests inside the container with `--ipc=host`

### Notes

- First run is slower because the Playwright base image is large.
- Next runs are faster due to Docker layer cache.
- Test artifacts are ignored by git via:
  - `playwright-report/`
  - `test-results/`

## Suggested CI order

Run checks in this order:

1. `npm run lint`
2. `npm run type-check`
3. `npm run test:integration`
4. `npm run build`
5. `npm run test:e2e:docker` (or `npm run test:e2e` if CI has browsers preinstalled)
