Playwright E2E tests

Location: test/e2e/

Tests are now organized into subfolders:

- `test/e2e/auth/` - authentication related flows (sign-up, sign-in, forgot password, verify, reset, dashboard redirect)
- `test/e2e/public/` - public page smoke tests (home, pricing, features, blog)

How to run locally:

1. Install dependencies and Playwright browsers (one-time per machine):

```powershell
pnpm install
pnpm run playwright:install
```

2. Run the E2E tests (this will start the dev server via the Playwright webServer setting):

```powershell
pnpm run test:e2e
```

Notes:

- Tests assume the app runs on http://localhost:3000. You can override by setting PLAYWRIGHT_BASE_URL.
- Playwright downloads browser binaries into the user cache. You only need to run `playwright install` once per machine (or cache the cache directory in CI).
