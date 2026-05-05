# Dev Controle

Versão em português (Brasil): [README.pt-BR.md](README.pt-BR.md)

Dev Controle is a web application focused on customer and ticket management.

The main goal is to allow each user to:

- register and manage their own clients
- create support tickets (chamados) linked to those clients
- track tickets by status and history within their own workspace

This repository is the initial version of the project and will evolve with authentication, data ownership rules, and full ticket workflows.

## Product Scope (Initial)

- Client registration
- Ticket creation linked to a client
- Per-user data visibility (each user sees only their own data)
- Dashboard for quick operational view

## Testing Docs

- English: [docs/testing.en.md](docs/testing.en.md)
- Português (Brasil): [docs/testing.pt-BR.md](docs/testing.pt-BR.md)

## Monitoring Docs

- English: [docs/monitoring.en.md](docs/monitoring.en.md)
- Português (Brasil): [docs/monitoring.pt-BR.md](docs/monitoring.pt-BR.md)

## CI/CD Docs

- English: [docs/ci-cd.en.md](docs/ci-cd.en.md)
- Português (Brasil): [docs/ci-cd.pt-BR.md](docs/ci-cd.pt-BR.md)

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- Vitest + Testing Library (integration tests)
- Playwright (E2E tests)

## Getting Started

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Useful Scripts

- `npm run dev`: start development server
- `npm run build`: build for production
- `npm run start`: run production build
- `npm run lint`: run ESLint
- `npm run type-check`: run TypeScript checks
- `npm run test:integration`: run integration tests
- `npm run test:e2e`: run Playwright E2E locally
- `npm run test:e2e:docker`: run E2E inside Docker

## Monitoring and Observability

This project now includes:

- Sentry for real-time error tracking with stack traces (client, server, and edge)
- Core Web Vitals collection focused on `LCP`, `INP`, and `CLS`

Client web-vitals are posted to:

- `POST /api/monitoring/web-vitals`

Poor and needs-improvement metrics are sent to Sentry as observability events.

### Environment variables

Add these variables in your environment:

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

Build-time source map upload requires `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, and `SENTRY_PROJECT`.

## Docker

The project includes:

- `Dockerfile`: production image for the app
- `Dockerfile.e2e`: Playwright image for E2E tests
- `docker-compose.yml`: orchestration for app and optional E2E service

### Prepare environment

Copy `.env.example` to `.env` and fill in Sentry values:

```bash
cp .env.example .env
```

### Run app with Docker Compose

```bash
npm run docker:up
```

Open `http://localhost:3000`.

### Follow logs

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

## Next Milestones

1. Authentication and authorization per user
2. Client CRUD
3. Ticket CRUD with status flow
4. Assignment and filtering by user
5. Audit trail and timeline per ticket

## Notes

- Project structure and conventions may continue to evolve as core features are implemented.
- For testing patterns, use the guides in `docs/testing.en.md` and `docs/testing.pt-BR.md`.

## CI/CD with GitHub Actions

The repository includes a CI workflow at:

- `.github/workflows/ci.yml`

Checks executed on CI:

- `npm run lint`
- `npm run type-check`
- `npm run test:integration`
- `npm run build`

### How to block merge unless checks pass

In your GitHub repository:

1. Go to `Settings` > `Branches`
2. Under `Branch protection rules`, click `Add rule`
3. Set `Branch name pattern` to `main`
4. Enable `Require a pull request before merging`
5. Enable `Require status checks to pass before merging`
6. Select required check:
   - `Lint, Typecheck, Tests and Build`
7. Save the rule

After this, PRs into `main` can only be merged when CI is green.

### Cost summary

- Public repositories: standard GitHub-hosted runners are free.
- Private repositories: monthly quota depends on plan; overage is billed.
- GitHub Pro (included for verified students in GitHub Education) includes a higher monthly Actions quota.

Always confirm current values in official docs:

- `docs.github.com` at _GitHub Actions billing_
- `github.com/education/students` for student benefits
