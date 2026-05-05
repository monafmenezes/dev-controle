# CI/CD Guide (GitHub Actions)

This document explains the CI pipeline, how to enforce merge blocking on pull requests, and cost basics.

## What is configured

Workflow file:

- `.github/workflows/ci.yml`

Triggers:

- `pull_request` to `main` and `develop`
- `push` to `main` and `develop`

Checks executed:

1. `npm run lint`
2. `npm run type-check`
3. `npm run test:integration`
4. `npm run build`

## Goal

Only allow PR merges when all required checks pass.

## How to enforce merge blocking

In your GitHub repository:

1. Open `Settings` > `Branches`
2. Under `Branch protection rules`, click `Add rule`
3. Set `Branch name pattern` to `main`
4. Enable `Require a pull request before merging`
5. Enable `Require status checks to pass before merging`
6. Select required check:
   - `Lint, Typecheck, Tests and Build`
7. Save

8. Repeat the same rule for `develop` (or create one rule pattern per branch strategy you use)

After this, PRs into `main` and `develop` cannot be merged unless CI is green.

## Local command parity

Run locally before pushing:

```bash
npm run lint
npm run type-check
npm run test:integration
npm run build
```

## Cost notes

- Public repositories: standard GitHub-hosted runners are free.
- Private repositories: monthly quota depends on account plan; usage above quota is billed.
- Verified students in GitHub Education have GitHub Pro benefits, including a higher Actions quota than Free.

Always verify current pricing and limits in official docs:

- GitHub Actions billing: `docs.github.com` (Billing > GitHub Actions)
- Student benefits: `github.com/education/students`
