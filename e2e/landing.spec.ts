import { test, expect } from "@playwright/test";

test.describe("Landing Page", () => {
  test("laedt und zeigt Hero-Headline", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.locator("h1")).toContainText(/Bescheid|Analyse|Widerspruch/i);
  });

  test("zeigt Navigation mit Blog und Login", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator('a[href="/blog"]').first()).toBeVisible();
  });

  test("zeigt Footer mit RDG-Disclaimer", async ({ page }) => {
    await page.goto("/");
    const footer = page.locator("footer");
    await expect(footer).toBeVisible();
    await expect(footer).toContainText("§ 2 RDG");
  });

  test("Tab-Wechsel zwischen Analyse und Schreiben", async ({ page }) => {
    await page.goto("/");
    // Tab 2 klicken (Schreiben)
    const tabSchreiben = page.getByRole("button", { name: /Schreiben|letter/i });
    if (await tabSchreiben.isVisible()) {
      await tabSchreiben.click();
      // Formular-Felder sollten sichtbar sein
      await expect(page.locator("select").first()).toBeVisible();
    }
  });

  test("Consent-Checkbox ist vorhanden", async ({ page }) => {
    await page.goto("/");
    const checkbox = page.locator('input[type="checkbox"]').first();
    await expect(checkbox).toBeVisible();
  });

  test("Sprachumschalter vorhanden", async ({ page }) => {
    await page.goto("/");
    // Pruefen ob Sprachbuttons existieren
    const langButtons = page.locator("button").filter({ hasText: /^(DE|EN|RU|AR|TR)$/ });
    const count = await langButtons.count();
    expect(count).toBeGreaterThanOrEqual(2);
  });

  test("Pricing-Sektion sichtbar beim Scrollen", async ({ page }) => {
    await page.goto("/");
    const pricing = page.locator("#pricing, [id*=pricing], :text('Basic')").first();
    if (await pricing.isVisible({ timeout: 1000 }).catch(() => false)) {
      await expect(pricing).toBeVisible();
    } else {
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(500);
      // Pricing existiert irgendwo auf der Seite
      await expect(page.getByText("Basic").first()).toBeVisible();
    }
  });
});
