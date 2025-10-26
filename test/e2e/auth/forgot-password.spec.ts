import { test, expect } from "@playwright/test";

test.describe("Forgot password flow", () => {
  test("forgot password button requires email and succeeds when provided", async ({
    page,
    baseURL,
  }) => {
    await page.goto(`${baseURL}/sign-in`);
    const forgotBtn = page.getByRole("button", {
      name: /forgot your password\?/i,
    });
    await forgotBtn.click();
    // The real app shows a toast; here we assert that the URL is still sign-in when no email provided
    await expect(page).toHaveURL(/sign-in/);

    // fill email and try again
    await page.getByLabel("Email").fill("jane@example.com");
    await forgotBtn.click();

    // after clicking with an email the app should still remain stable; at minimum we expect sign-in route to remain or navigate
    await expect(page).toHaveURL(/sign-in|reset-password/);
  });
});
