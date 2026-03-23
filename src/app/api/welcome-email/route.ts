/**
 * POST /api/welcome-email
 *
 * Sendet eine Welcome-Email an neu registrierte Nutzer.
 * Wird vom Frontend nach erfolgreichem signUp() aufgerufen.
 *
 * Body: { email: string; firstName: string }
 */

import { NextRequest, NextResponse } from "next/server";
import { reportError, reportInfo } from "@/lib/error-reporter";
import { welcomeEmailLimiter } from "@/lib/rate-limit";

export const runtime = "nodejs";

function buildWelcomeHtml(firstName: string): string {
  return `
    <div style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto">
      <div style="background:#0f172a;padding:24px 32px;border-radius:12px 12px 0 0">
        <h1 style="color:white;margin:0;font-size:22px;font-weight:800">BescheidRecht</h1>
        <p style="color:rgba(255,255,255,0.7);margin:6px 0 0;font-size:14px">Ihr Konto wurde erstellt</p>
      </div>
      <div style="border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px;padding:28px 32px;background:#ffffff">
        <p style="color:#111827;font-size:16px;margin:0 0 16px;line-height:1.6">
          Hallo ${firstName},
        </p>
        <p style="color:#374151;font-size:15px;margin:0 0 16px;line-height:1.6">
          willkommen bei BescheidRecht! Ihr Konto ist aktiv und Sie koennen sofort loslegen.
        </p>
        <p style="color:#374151;font-size:15px;margin:0 0 24px;line-height:1.6">
          Mit BescheidRecht pruefen Sie Behoerdenbescheide auf Fehler und erstellen
          rechtssichere Widerspruchsschreiben — in wenigen Minuten statt Stunden.
        </p>
        <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px 20px;margin:0 0 24px">
          <p style="color:#475569;font-size:14px;margin:0 0 8px;font-weight:600">So funktioniert es:</p>
          <ol style="color:#475569;font-size:14px;margin:0;padding-left:20px;line-height:1.8">
            <li>Bescheid hochladen (PDF oder Foto)</li>
            <li>KI-Analyse startet automatisch</li>
            <li>Fehler und Widerspruchsschreiben erhalten</li>
          </ol>
        </div>
        <div style="text-align:center;margin:0 0 24px">
          <a href="https://www.bescheidrecht.de/analyze" style="display:inline-block;background:#0f172a;color:white;padding:12px 32px;border-radius:8px;text-decoration:none;font-weight:700;font-size:15px">
            Erste Analyse starten
          </a>
        </div>
        <p style="color:#9ca3af;font-size:12px;margin:0;text-align:center;line-height:1.5">
          Bei Fragen antworten Sie einfach auf diese E-Mail.<br/>
          BescheidRecht — KI-gestuetzte Bescheidpruefung
        </p>
      </div>
    </div>
  `;
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const { success } = await welcomeEmailLimiter.limit(ip);
    if (!success) {
      return NextResponse.json({ error: "Zu viele Anfragen" }, { status: 429 });
    }

    const body = await req.json();
    const email = body.email?.trim();
    const firstName = body.firstName?.trim() || "Nutzer";

    if (!email) {
      return NextResponse.json({ error: "E-Mail fehlt" }, { status: 400 });
    }

    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      reportError(new Error("RESEND_API_KEY nicht gesetzt"), {
        context: "welcome-email",
      }).catch(() => {});
      return NextResponse.json({ sent: false, reason: "no_api_key" });
    }

    const { Resend } = await import("resend");
    const resend = new Resend(resendApiKey);

    const fromAddr =
      process.env.RESEND_FROM_EMAIL || "BescheidRecht <onboarding@resend.dev>";

    await resend.emails.send({
      from: fromAddr,
      to: email,
      subject: `Willkommen bei BescheidRecht, ${firstName}!`,
      html: buildWelcomeHtml(firstName),
    });

    reportInfo(`[Welcome-Email] Versendet an ${email.slice(0, 3)}***`);
    return NextResponse.json({ sent: true });
  } catch (err) {
    reportError(err instanceof Error ? err : new Error(String(err)), {
      context: "welcome-email",
      critical: false,
    }).catch(() => {});
    return NextResponse.json({ sent: false, error: "Fehler beim Versenden" });
  }
}
