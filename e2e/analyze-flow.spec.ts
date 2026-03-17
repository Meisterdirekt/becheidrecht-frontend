import { test, expect } from "@playwright/test";

test.describe("Analyse-Flow", () => {
  test("Analyse-Seite laedt ohne Serverfehler", async ({ page }) => {
    const response = await page.goto("/analyze");
    // Seite sollte laden (200 oder 307 Redirect)
    expect(response?.status()).toBeLessThan(500);
  });

  test("Analyse-API gibt 401 oder 429 ohne Token", async ({ request }) => {
    const response = await request.post("/api/analyze", {
      data: {},
      headers: { "Content-Type": "application/json" },
    });
    // 401 (Unauthorized) oder 429 (Rate-Limit) — beides korrekt ohne Auth
    expect([401, 429]).toContain(response.status());
  });

  test("Generate-Letter-API gibt 401 ohne Token", async ({ request }) => {
    const response = await request.post("/api/generate-letter", {
      data: {
        behoerde: "jobcenter",
        schreibentyp: "widerspruch",
        stichpunkte: "Test-Stichpunkte fuer den Widerspruch hier eingeben",
      },
      headers: { "Content-Type": "application/json" },
    });
    expect(response.status()).toBe(401);
  });

  test("Assistant-API gibt 401 ohne Token", async ({ request }) => {
    const response = await request.post("/api/assistant", {
      data: {
        traeger: "jobcenter",
        beschreibung: "Test-Beschreibung",
        schritt: "analyse",
      },
      headers: { "Content-Type": "application/json" },
    });
    expect(response.status()).toBe(401);
  });

  test("Subscription-Status-API gibt 401 ohne Token", async ({ request }) => {
    const response = await request.get("/api/subscription-status");
    expect(response.status()).toBe(401);
  });
});
