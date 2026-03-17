import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { demoRequestLimiter } from "@/lib/rate-limit";
import { reportError } from "@/lib/error-reporter";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getSupabaseClient() {
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "";
  const anonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    "";
  if (!url || !anonKey) return null;
  return createClient(url, anonKey);
}

async function sendNotification(data: {
  org_name: string;
  contact_name: string;
  email: string;
  phone: string | null;
  berater_count: number | null;
  message: string | null;
  selected_tarif: string | null;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return;

  try {
    const { Resend } = await import("resend");
    const resend = new Resend(apiKey);

    const rows = [
      ["Organisation", data.org_name],
      ["Ansprechpartner", data.contact_name],
      ["E-Mail", data.email],
      ["Telefon", data.phone || "–"],
      ["Anzahl Berater", data.berater_count ? String(data.berater_count) : "–"],
      ["Gewünschter Tarif", data.selected_tarif || "–"],
      ["Nachricht", data.message || "–"],
    ];

    const tableRows = rows
      .map(
        ([label, value]) =>
          `<tr><td style="padding:8px 12px;font-weight:600;color:#374151;border-bottom:1px solid #e5e7eb">${label}</td><td style="padding:8px 12px;color:#111827;border-bottom:1px solid #e5e7eb">${value}</td></tr>`
      )
      .join("");

    const verifiedDomain = process.env.RESEND_FROM_EMAIL;
    const fromAddr = verifiedDomain || "BescheidRecht <onboarding@resend.dev>";
    const toAddr = process.env.RESEND_TO_EMAIL || "hendrikberkenstrater@gmail.com";

    await resend.emails.send({
      from: fromAddr,
      to: toAddr,
      subject: `Neue Demo-Anfrage: ${data.org_name}`,
      html: `
        <div style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto">
          <h2 style="color:#0ea5e9;margin-bottom:4px">Neue Demo-Anfrage</h2>
          <p style="color:#6b7280;margin-top:0">Eingegangen am ${new Date().toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
          <table style="width:100%;border-collapse:collapse;margin:16px 0">${tableRows}</table>
          <p style="color:#6b7280;font-size:13px;margin-top:24px">Verwalten unter: <a href="https://www.bescheidrecht.de/admin">Admin-Panel</a></p>
        </div>
      `,
    });
  } catch (err) {
    await reportError(err, { context: "demo-request/email" });
  }
}

export async function POST(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";

  const { success: allowed } = await demoRequestLimiter.limit(ip);
  if (!allowed) {
    return NextResponse.json(
      { error: "Zu viele Anfragen. Bitte später erneut versuchen." },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();

    const org_name =
      typeof body.org_name === "string" ? body.org_name.trim() : "";
    const contact_name =
      typeof body.contact_name === "string" ? body.contact_name.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim() : "";
    const phone =
      typeof body.phone === "string" && body.phone.trim()
        ? body.phone.trim()
        : null;
    const berater_count =
      typeof body.berater_count === "number" &&
      body.berater_count >= 1 &&
      body.berater_count <= 9999
        ? body.berater_count
        : null;
    const message =
      typeof body.message === "string" && body.message.trim()
        ? body.message.trim()
        : null;
    const selected_tarif =
      typeof body.selected_tarif === "string" && body.selected_tarif.trim()
        ? body.selected_tarif.trim()
        : null;

    if (!org_name || org_name.length < 2) {
      return NextResponse.json(
        { error: "Bitte geben Sie den Namen Ihrer Organisation ein." },
        { status: 400 }
      );
    }
    if (!contact_name || contact_name.length < 2) {
      return NextResponse.json(
        { error: "Bitte geben Sie Ihren Namen ein." },
        { status: 400 }
      );
    }
    if (!email || !EMAIL_RE.test(email)) {
      return NextResponse.json(
        { error: "Bitte geben Sie eine gültige E-Mail-Adresse ein." },
        { status: 400 }
      );
    }
    if (message && message.length > 2000) {
      return NextResponse.json(
        { error: "Nachricht darf maximal 2000 Zeichen lang sein." },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();
    if (!supabase) {
      return NextResponse.json(
        { error: "Service derzeit nicht verfügbar." },
        { status: 503 }
      );
    }

    const { error } = await supabase.from("demo_requests").insert({
      org_name,
      contact_name,
      email,
      phone,
      berater_count,
      message,
      selected_tarif,
    });

    if (error) {
      await reportError(error, { context: "demo-request/insert" });
      return NextResponse.json(
        { error: "Anfrage konnte nicht gespeichert werden. Bitte später erneut versuchen." },
        { status: 500 }
      );
    }

    // E-Mail-Benachrichtigung (fire-and-forget, blockiert nicht die Response)
    sendNotification({
      org_name,
      contact_name,
      email,
      phone,
      berater_count,
      message,
      selected_tarif,
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    await reportError(e, { context: "demo-request" });
    return NextResponse.json(
      { error: "Ein Fehler ist aufgetreten. Bitte später erneut versuchen." },
      { status: 500 }
    );
  }
}
