import { test, expect } from "@playwright/test";

test.describe("Mobile Responsiveness (375px)", () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test("Landing Page passt auf 375px ohne horizontalen Scroll", async ({ page }) => {
    await page.goto("/");
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = await page.evaluate(() => window.innerWidth);
    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 1);
  });

  test("Navigation ist auf Mobile sichtbar oder hat Hamburger-Menu", async ({ page }) => {
    await page.goto("/");
    // Entweder Nav-Links sichtbar oder ein Menu-Button
    const navVisible = await page.locator("nav").isVisible().catch(() => false);
    expect(navVisible).toBeTruthy();
  });

  test("Footer ist auf Mobile lesbar", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(300);
    const footer = page.locator("footer");
    await expect(footer).toBeVisible();
    const footerBox = await footer.boundingBox();
    expect(footerBox).toBeTruthy();
    if (footerBox) {
      expect(footerBox.width).toBeLessThanOrEqual(375);
    }
  });

  test("Blog-Seite ist auf Mobile lesbar", async ({ page }) => {
    await page.goto("/blog");
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    expect(bodyWidth).toBeLessThanOrEqual(376);
  });
});
