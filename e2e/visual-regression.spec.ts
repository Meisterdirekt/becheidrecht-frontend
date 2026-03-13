import { test } from "@playwright/test";

/**
 * Visual Regression — Screenshots aller Schlüsselseiten.
 * Speichert Desktop + Mobile Screenshots als CI-Artifacts.
 * Dient als visuelle Baseline für Regressionserkennung.
 */

const PAGES = [
  { path: "/", name: "homepage" },
  { path: "/b2b", name: "b2b" },
  { path: "/login", name: "login" },
  { path: "/analyze", name: "analyze" },
  { path: "/datenschutz", name: "datenschutz" },
];

test.describe("Visual Regression — Desktop", () => {
  for (const { path, name } of PAGES) {
    test(`Screenshot ${name}`, async ({ page }) => {
      await page.goto(path, { waitUntil: "networkidle" });
      // Kurze Wartezeit für CSS-Animationen
      await page.waitForTimeout(500);
      await page.screenshot({
        path: `e2e/screenshots/desktop-${name}.png`,
        fullPage: true,
      });
    });
  }
});

test.describe("Visual Regression — Mobile (375px)", () => {
  test.use({ viewport: { width: 375, height: 812 } });

  for (const { path, name } of PAGES) {
    test(`Screenshot ${name}`, async ({ page }) => {
      await page.goto(path, { waitUntil: "networkidle" });
      await page.waitForTimeout(500);
      await page.screenshot({
        path: `e2e/screenshots/mobile-${name}.png`,
        fullPage: true,
      });
    });
  }
});
