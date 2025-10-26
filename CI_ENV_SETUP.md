# CI Environment Setup

This file lists the environment variables (Secrets and Repository Variables) you should add to GitHub for Actions to run correctly.

## Secrets (add in Settings → Secrets and variables → Actions → New repository secret)

- DATABASE_URL (required)
  - Example: `postgresql://postgres:strongPassword@db-host.example.com:5432/cashio_saas`
  - Usage: Prisma and server runtime. Keep secret.

- BETTER_AUTH_SECRET (required)
  - Example: a long random string (32+ chars)
  - Usage: auth/session signing secret.

- RESEND_API_KEY (required)
  - Example: `key-xxxxxxxx`
  - Usage: transactional email API key used by server.

- EMAIL_FROM (required)
  - Example: `noreply@example.com`
  - Usage: "from" address for transactional emails.

- (Optional) OAuth secrets (if used):
  - GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET
  - GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET

- (Optional) NPM_TOKEN
  - Usage: if CI publishes packages to npm.

## Repository Variables (add in Settings → Secrets and variables → Actions → New repository variable)

- BETTER_AUTH_URL
  - Example: `https://app.example.com` or `http://localhost:3000` for dev
  - Usage: Auth callback base URL (non-sensitive if public)

- NEXT_PUBLIC_BETTER_STACK_SOURCE_TOKEN
  - Example: `public-token-abc`
  - Usage: client-side logging token (exposed in frontend)

- NEXT_PUBLIC_BETTER_STACK_INGESTING_URL
  - Example: `https://ingest.log.example.com`
  - Usage: client-side log ingestion endpoint

- NEXT_PUBLIC_BETTER_STACK_LOG_LEVEL
  - Example: `debug`
  - Usage: client log level

- (Optional) SKIP_ENV_VALIDATION
  - Example: `true` (only for temporary debugging — not recommended)

## How workflows reference them

- Secrets: `${{ secrets.DATABASE_URL }}`
- Repo variables: `${{ vars.NEXT_PUBLIC_BETTER_STACK_SOURCE_TOKEN }}`

Example job-level `env` block you can add to workflows:

```yaml
env:
  DATABASE_URL: ${{ secrets.DATABASE_URL }}
  BETTER_AUTH_SECRET: ${{ secrets.BETTER_AUTH_SECRET }}
  BETTER_AUTH_URL: ${{ vars.BETTER_AUTH_URL }}
  RESEND_API_KEY: ${{ secrets.RESEND_API_KEY }}
  EMAIL_FROM: ${{ secrets.EMAIL_FROM }}
  NEXT_PUBLIC_BETTER_STACK_SOURCE_TOKEN: ${{ vars.NEXT_PUBLIC_BETTER_STACK_SOURCE_TOKEN }}
  NEXT_PUBLIC_BETTER_STACK_INGESTING_URL: ${{ vars.NEXT_PUBLIC_BETTER_STACK_INGESTING_URL }}
  NEXT_PUBLIC_BETTER_STACK_LOG_LEVEL: ${{ vars.NEXT_PUBLIC_BETTER_STACK_LOG_LEVEL }}
```

## Notes

- Don’t add sensitive values to `NEXT_PUBLIC_` vars — those are embedded into the client bundle.
- GitHub masks secrets in logs but avoid echoing them in workflow steps.
- For PRs from forks, secrets are unavailable by default. Use repo variables or a separate strategy for public PR checks.
- For local development, copy `.env.example` → `.env` and populate values (this file is .gitignored).

If you want, I can insert the `env` blocks directly into other workflows (release, lint-pr, etc.), or add Environment-level secrets for `production` with approval gates.
