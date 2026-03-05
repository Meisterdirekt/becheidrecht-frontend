import { test, expect } from "@playwright/test";

test.describe("Blog", () => {
  test("Blog-Uebersicht laedt", async ({ page }) => {
    await page.goto("/blog");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("Blog-Artikel sind verlinkt", async ({ page }) => {
    await page.goto("/blog");
    const articleLinks = page.locator('a[href^="/blog/"]');
    const count = await articleLinks.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test("Blog-Einzelartikel laedt mit RDG-Disclaimer", async ({ page }) => {
    await page.goto("/blog");
    const firstLink = page.locator('a[href^="/blog/"]').first();
    const href = await firstLink.getAttribute("href");
    if (href) {
      await page.goto(href);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      // RDG-Disclaimer am Ende des Artikels
      await expect(page.getByText("§ 2 RDG").first()).toBeVisible();
    }
  });
});
