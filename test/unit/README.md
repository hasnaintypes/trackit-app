This folder contains unit tests, organized by the type of code under test.

Recommended structure:

- `components/` - component tests (e.g. `components/auth/login-form.test.tsx`).
- `hooks/` - tests for custom React hooks.
- `lib/` - pure library / utility tests (e.g. `lib/utils.test.ts`).
- `pages/` - tests for page-level logic if needed.

Current layout:

- `components/auth/login-form.test.tsx` - moved from the root of this folder.
- `lib/utils.test.ts` - moved from the root of this folder.

Notes:

- During migration the old top-level files are kept as placeholders to avoid
  accidental duplicate test runs. Remove the placeholder files once all
  CI and local runners reference the new paths.
