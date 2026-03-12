import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

/** GET: Anzahl zahlender Nutzer (user_subscriptions) – für Anzeige „X Nutzer vertrauen uns“ */
export async function GET() {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "";
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
    if (!url || !serviceKey) {
      return NextResponse.json({ count: 0 });
    }
    const supabase = createClient(url, serviceKey);
    const { count, error } = await supabase
      .from("user_subscriptions")
      .select("*", { count: "exact", head: true });
    if (error) {
      console.error("Customer count error:", error);
      return NextResponse.json({ count: 0 });
    }
    return NextResponse.json(
      { count: count ?? 0 },
      { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120" } }
    );
  } catch (e) {
    console.error("Customer count error:", e);
    return NextResponse.json({ count: 0 });
  }
}
