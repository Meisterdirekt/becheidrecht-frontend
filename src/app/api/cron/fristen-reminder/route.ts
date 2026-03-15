/**
 * Fristen-Erinnerung — E-Mail-Benachrichtigung bei nahenden Fristen
 * GET /api/cron/fristen-reminder?secret=CRON_SECRET
 *
 * Laueft taeglich 08:00 UTC via Vercel Cron.
 * Sendet E-Mail-Erinnerungen an Nutzer mit offenen Fristen:
 * - 7 Tage vorher: erste Erinnerung
 * - 3 Tage vorher: dringende Erinnerung
 * - 1 Tag vorher: letzte Erinnerung
 * - Am Fristtag: Frist laeuft HEUTE ab
 */

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { reportError, reportInfo } from "@/lib/error-reporter";

export const runtime = "nodejs";
export const maxDuration = 30;

const REMINDER_DAYS = [7, 3, 1, 0] as const;

function verifySecret(req: Request): boolean {
  const url = new URL(req.url);
  const authHeader = req.headers?.get?.("authorization") || "";
  const secret =
    url.searchParams.get("secret") || authHeader.replace("Bearer ", "");
  const expected = process.env.CRON_SECRET;
  return !!expected && secret === expected;
}

interface FristRow {
  id: string;
  user_id: string;
  behoerde: string | null;
  rechtsgebiet: string | null;
  frist_datum: string;
  status: string;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function buildEmailHtml(fristen: FristRow[], tageVerbleibend: number): string {
  const dringend = tageVerbleibend <= 1;
  const farbe = dringend ? "#ef4444" : tageVerbleibend <= 3 ? "#f59e0b" : "#0ea5e9";

  const tageText =
    tageVerbleibend === 0
      ? "heute"
      : tageVerbleibend === 1
      ? "morgen"
      : `in ${tageVerbleibend} Tagen`;

  const rows = fristen
    .map(
      (f) =>
        `<tr>
          <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;color:#111827">${f.behoerde ?? "Unbekannt"}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;color:#111827">${f.rechtsgebiet ?? "–"}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;color:${farbe};font-weight:600">${formatDate(f.frist_datum)}</td>
        </tr>`
    )
    .join("");

  return `
    <div style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto">
      <div style="background:${farbe};padding:16px 24px;border-radius:12px 12px 0 0">
        <h2 style="color:white;margin:0;font-size:18px">
          ${dringend ? "Dringende Fristen-Erinnerung" : "Fristen-Erinnerung"}
        </h2>
        <p style="color:rgba(255,255,255,0.85);margin:4px 0 0;font-size:14px">
          ${fristen.length === 1 ? "Eine Widerspruchsfrist" : `${fristen.length} Widerspruchsfristen`} ${fristen.length === 1 ? "laeuft" : "laufen"} ${tageText} ab.
        </p>
      </div>
      <div style="border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px;padding:20px 24px">
        <table style="width:100%;border-collapse:collapse">
          <thead>
            <tr style="text-align:left">
              <th style="padding:8px 12px;border-bottom:2px solid #e5e7eb;color:#6b7280;font-size:12px;text-transform:uppercase;letter-spacing:0.05em">Behoerde</th>
              <th style="padding:8px 12px;border-bottom:2px solid #e5e7eb;color:#6b7280;font-size:12px;text-transform:uppercase;letter-spacing:0.05em">Rechtsgebiet</th>
              <th style="padding:8px 12px;border-bottom:2px solid #e5e7eb;color:#6b7280;font-size:12px;text-transform:uppercase;letter-spacing:0.05em">Frist</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
        <div style="margin-top:20px;text-align:center">
          <a href="https://www.bescheidrecht.de/fristen" style="display:inline-block;background:${farbe};color:white;padding:10px 24px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px">
            Fristen ansehen
          </a>
        </div>
        <p style="color:#9ca3af;font-size:11px;margin-top:20px;text-align:center">
          Diese E-Mail wurde automatisch von BescheidRecht versendet.
        </p>
      </div>
    </div>
  `;
}

export async function GET(req: Request) {
  if (!verifySecret(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  const resendApiKey = process.env.RESEND_API_KEY || "";

  if (!url || !serviceKey) {
    return NextResponse.json(
      { error: "Missing Supabase config" },
      { status: 500 }
    );
  }

  if (!resendApiKey) {
    return NextResponse.json(
      { error: "Missing RESEND_API_KEY" },
      { status: 500 }
    );
  }

  const supabase = createClient(url, serviceKey);
  const { Resend } = await import("resend");
  const resend = new Resend(resendApiKey);

  const fromAddr =
    process.env.RESEND_FROM_EMAIL || "BescheidRecht <onboarding@resend.dev>";

  let totalSent = 0;
  let totalErrors = 0;

  for (const days of REMINDER_DAYS) {
    // Zieldatum berechnen
    const target = new Date();
    target.setUTCHours(0, 0, 0, 0);
    target.setUTCDate(target.getUTCDate() + days);
    const targetIso = target.toISOString().split("T")[0];

    // Offene Fristen fuer dieses Datum laden
    const { data: fristen, error: dbError } = await supabase
      .from("user_fristen")
      .select("id, user_id, behoerde, rechtsgebiet, frist_datum, status")
      .eq("status", "offen")
      .eq("frist_datum", targetIso);

    if (dbError) {
      reportError(new Error(`fristen-reminder DB: ${dbError.message}`), {
        critical: false,
        context: "fristen-reminder",
      }).catch(() => {});
      totalErrors++;
      continue;
    }

    if (!fristen || fristen.length === 0) continue;

    // Gruppieren nach user_id
    const byUser = new Map<string, FristRow[]>();
    for (const f of fristen as FristRow[]) {
      const list = byUser.get(f.user_id) || [];
      list.push(f);
      byUser.set(f.user_id, list);
    }

    // E-Mail pro User senden
    for (const [userId, userFristen] of byUser) {
      // User-E-Mail aus auth.users holen (Service-Key hat Zugriff)
      const {
        data: { user },
      } = await supabase.auth.admin.getUserById(userId);

      if (!user?.email) continue;

      try {
        await resend.emails.send({
          from: fromAddr,
          to: user.email,
          subject:
            days === 0
              ? "Widerspruchsfrist laeuft HEUTE ab!"
              : days === 1
              ? "Widerspruchsfrist laeuft morgen ab!"
              : `Widerspruchsfrist in ${days} Tagen`,
          html: buildEmailHtml(userFristen, days),
        });
        totalSent++;
      } catch (err) {
        totalErrors++;
        reportError(
          err instanceof Error ? err : new Error(String(err)),
          { critical: false, context: "fristen-reminder", userId }
        ).catch(() => {});
      }
    }
  }

  reportInfo(`[Fristen-Reminder] ${totalSent} E-Mails versendet, ${totalErrors} Fehler`);

  return NextResponse.json({
    ok: totalErrors === 0,
    sent: totalSent,
    errors: totalErrors,
    reminder_days: REMINDER_DAYS,
  });
}
