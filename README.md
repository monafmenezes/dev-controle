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

## Next Milestones

1. Authentication and authorization per user
2. Client CRUD
3. Ticket CRUD with status flow
4. Assignment and filtering by user
5. Audit trail and timeline per ticket

## Notes

- Project structure and conventions may continue to evolve as core features are implemented.
- For testing patterns, use the guides in `docs/testing.en.md` and `docs/testing.pt-BR.md`.
