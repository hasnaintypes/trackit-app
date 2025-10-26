import { test, expect } from "@playwright/test";

test.describe("Auth pages", () => {
  test("signup page shows signup form", async ({ page, baseURL }) => {
    await page.goto(`${baseURL}/sign-up`);
    await expect(
      page.getByRole("heading", { name: /create your account/i }),
    ).toBeVisible();
    await expect(page.getByLabel("Email")).toBeVisible();
    // Target the actual input element to avoid matching the "show password" button which contains the word "password"
    await expect(page.locator("input#password")).toBeVisible();
  });
});
