import { test, expect } from "@playwright/test";

test.describe("Rechtliche Seiten", () => {
  test("AGB-Seite laedt mit RDG-Disclaimer", async ({ page }) => {
    await page.goto("/agb");
    await expect(page).toHaveTitle(/AGB|Allgemeine/i);
    await expect(page.getByText("Rechtsdienstleistungsgesetz")).toBeVisible();
    await expect(page.getByText("§ 2 RDG").first()).toBeVisible();
  });

  test("Datenschutz-Seite laedt", async ({ page }) => {
    await page.goto("/datenschutz");
    await expect(page.getByText(/Datenschutz|DSGVO/i).first()).toBeVisible();
  });

  test("Impressum-Seite laedt mit Pflichtangaben", async ({ page }) => {
    await page.goto("/impressum");
    await expect(page.getByText(/Impressum/i).first()).toBeVisible();
    // TMG-Pflichtangabe
    await expect(page.getByText(/TMG|Telemediengesetz/i).first()).toBeVisible();
  });

  test("Footer-Links fuehren zu den richtigen Seiten", async ({ page }) => {
    await page.goto("/");
    const footer = page.locator("footer");

    const impressumLink = footer.locator('a[href="/impressum"]');
    await expect(impressumLink).toBeVisible();

    const datenschutzLink = footer.locator('a[href="/datenschutz"]');
    await expect(datenschutzLink).toBeVisible();

    const agbLink = footer.locator('a[href="/agb"]');
    await expect(agbLink).toBeVisible();
  });
});
