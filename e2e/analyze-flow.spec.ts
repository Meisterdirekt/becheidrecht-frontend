import { test, expect } from "@playwright/test";

test.describe("Analyse-Flow", () => {
  test("Analyse-Seite erfordert Login", async ({ page }) => {
    await page.goto("/analyze");
    // Sollte entweder Login-Hinweis zeigen oder zur Login-Seite weiterleiten
    const content = await page.textContent("body");
    const requiresAuth =
      content?.includes("anmelden") ||
      content?.includes("Anmelden") ||
      content?.includes("Login") ||
      page.url().includes("/login");
    expect(requiresAuth).toBeTruthy();
  });

  test("Analyse-API gibt 401 ohne Token", async ({ request }) => {
    const response = await request.post("/api/analyze", {
      data: {},
      headers: { "Content-Type": "application/json" },
    });
    expect(response.status()).toBe(401);
    const body = await response.json();
    expect(body.error).toBeTruthy();
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
