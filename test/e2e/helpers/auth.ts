import type { Page, Route } from "@playwright/test";

/**
 * Inject a fake authenticated user into the browser's localStorage before the app loads.
 * This avoids needing a full backend sign-in for tests and keeps tests deterministic.
 *
 * Assumptions:
 * - The app reads a client-side session flag (localStorage key `__TEST_AUTH_USER__`) in tests.
 * - Components that rely on server sessions will need network interception or server-side seeding.
 */
export async function setTestAuthLocalStorage(
  page: Page,
  user: { id: string; name: string; email: string },
): Promise<void> {
  await page.addInitScript((u: { id: string; name: string; email: string }) => {
    try {
      // Store a simple JSON blob that tests and client code can use if present
      localStorage.setItem("__TEST_AUTH_USER__", JSON.stringify(u));
    } catch (_e) {
      // ignore
    }
  }, user);
}

/**
 * Remove the test auth localStorage entry.
 */
export async function clearTestAuthLocalStorage(page: Page): Promise<void> {
  await page.addInitScript(() => {
    try {
      localStorage.removeItem("__TEST_AUTH_USER__");
    } catch (_e) {
      // ignore
    }
  });
}

/**
 * Intercept common auth-related network requests and return deterministic responses.
 * Customize the URL patterns to match your app's network calls if necessary.
 */
export async function interceptAuthRequests(
  page: Page,
  user: { id: string; name: string; email: string },
): Promise<void> {
  // Example: intercept a session fetch used by the client at /api/auth/session
  await page.route("**/api/**/session**", (route: Route) => {
    return route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        user: { id: user.id, name: user.name, email: user.email },
        expiresAt: new Date(Date.now() + 1000 * 60 * 60).toISOString(),
      }),
    });
  });

  // Example: intercept sign-in POST if the app posts to /api/auth/signin
  await page.route("**/api/**/signin**", (route: Route) => {
    return route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        user: { id: user.id, name: user.name, email: user.email },
      }),
    });
  });
}
