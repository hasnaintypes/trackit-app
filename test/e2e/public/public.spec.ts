import { test, expect } from "@playwright/test";

test.describe("Public pages smoke tests", () => {
  test("home page loads", async ({ page, baseURL }) => {
    await page.goto(`${baseURL}/`);
    // Basic content check - ensure the main hero heading is visible
    await expect(
      page.getByRole("heading", { name: /smartest way to manage money/i }),
    ).toBeVisible();
  });

  test("pricing page loads", async ({ page, baseURL }) => {
    await page.goto(`${baseURL}/pricing`);
    // Target the page heading "Pricing" specifically to avoid ambiguous matches
    await expect(page.getByRole("heading", { name: /pricing/i })).toBeVisible();
  });

  test("features page loads", async ({ page, baseURL }) => {
    await page.goto(`${baseURL}/features`);
    // The features section is anchored with id="features"
    await expect(page.locator("#features")).toBeVisible();
  });

  test("blog listing loads", async ({ page, baseURL }) => {
    await page.goto(`${baseURL}/blog`);
    // Blog page uses an h1 "Latest articles & insights" — target that heading
    await expect(
      page.getByRole("heading", {
        name: /latest articles & insights|latest articles/i,
      }),
    ).toBeVisible();
  });
});
