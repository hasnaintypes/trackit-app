import { test, expect } from "@playwright/test";

test.describe("Verify and Reset pages", () => {
  test("verify-success page renders", async ({ page, baseURL }) => {
    await page.goto(`${baseURL}/verify-success`);
    // Prefer checking the heading for a clear, unique target (heading contains 'Verified' text)
    await expect(
      page.getByRole("heading", { name: /verified|email verified/i }),
    ).toBeVisible();
  });

  test("reset-password page renders", async ({ page, baseURL }) => {
    await page.goto(`${baseURL}/reset-password`);
    await expect(page.getByRole("heading")).toBeVisible();
  });
});
