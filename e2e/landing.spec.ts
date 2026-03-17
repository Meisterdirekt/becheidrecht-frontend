import { test, expect } from "@playwright/test";

test.describe("Landing Page", () => {
  test("laedt und zeigt Hero-Headline", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.locator("h1")).toContainText(/Bescheid|Analyse|Widerspruch/i);
  });

  test("zeigt Navigation mit Login-Link", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator('a[href="/login"]').first()).toBeVisible();
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
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);
    // B2B-Pricing oder CTA-Bereich sollte sichtbar sein
    const pricing = page.locator("#pricing, [id*=pricing]").first();
    const b2bCta = page.getByText(/Einrichtung|B2B|Kontakt/i).first();
    const hasPricing = await pricing.isVisible().catch(() => false);
    const hasB2bCta = await b2bCta.isVisible().catch(() => false);
    expect(hasPricing || hasB2bCta).toBeTruthy();
  });
});
