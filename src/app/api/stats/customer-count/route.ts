import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

/** GET: Anzahl zahlender Nutzer (user_subscriptions) — für Anzeige "X Nutzer vertrauen uns" */
export async function GET() {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL ?? "";
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.SUPABASE_ANON_KEY ?? "";
    if (!url || !anonKey) {
      return NextResponse.json({ count: 0 });
    }
    const supabase = createClient(url, anonKey);
    const { count, error } = await supabase
      .from("user_subscriptions")
      .select("*", { count: "exact", head: true })
      .neq("subscription_type", "free");
    if (error) {
      return NextResponse.json({ count: 0 });
    }
    return NextResponse.json(
      { count: count ?? 0 },
      { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" } }
    );
  } catch {
    return NextResponse.json({ count: 0 });
  }
}
