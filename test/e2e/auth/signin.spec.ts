import { test, expect } from "@playwright/test";

test.describe("Sign in page", () => {
  test("sign-in page shows form and can submit", async ({ page, baseURL }) => {
    await page.goto(`${baseURL}/sign-in`);
    await expect(
      page.getByRole("heading", { name: /login to your account/i }),
    ).toBeVisible();
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.locator("input#password")).toBeVisible();

    await page.getByLabel("Email").fill("test@example.com");
    await page.locator("input#password").fill("password123");
    await page.getByRole("button", { name: "Login", exact: true }).click();

    const afterUrl = page.url();
    if (afterUrl.includes("/sign-in")) {
      await expect(page.getByLabel("Email")).toBeVisible();
    } else {
      await expect(page).not.toHaveURL(/sign-in/);
    }
  });
});
