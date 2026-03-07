import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * GET /api/admin/customers
 *
 * Gibt alle User-Subscriptions zurück (Admin-only).
 * Query-Params: ?status=active&q=suchbegriff
 */

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

async function verifyAdmin(request: NextRequest): Promise<boolean> {
  const adminSecret = process.env.ADMIN_SECRET;
  if (adminSecret && request.headers.get("x-admin-token") === adminSecret)
    return true;

  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return false;

  const token = authHeader.replace("Bearer ", "").trim();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
  if (!url || !anonKey) return false;

  const supabase = createClient(url, anonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) return false;
  return ADMIN_EMAILS.includes(user.email.toLowerCase());
}

export async function GET(request: NextRequest) {
  const authorized = await verifyAdmin(request);
  if (!authorized) {
    return NextResponse.json({ error: "Kein Admin-Zugang" }, { status: 403 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
  if (!url || !serviceKey) {
    return NextResponse.json(
      { error: "Supabase nicht konfiguriert" },
      { status: 500 },
    );
  }

  const admin = createClient(url, serviceKey, {
    auth: { persistSession: false },
  });

  const searchParams = request.nextUrl.searchParams;
  const statusFilter = searchParams.get("status");
  const query = searchParams.get("q")?.toLowerCase().trim();

  let dbQuery = admin
    .from("user_subscriptions")
    .select(
      "user_id, email, subscription_type, status, analyses_total, analyses_remaining, analyses_used, payment_method, purchased_at, expires_at, updated_at",
    )
    .order("purchased_at", { ascending: false, nullsFirst: false });

  if (statusFilter) {
    dbQuery = dbQuery.eq("status", statusFilter);
  }

  if (query) {
    dbQuery = dbQuery.ilike("email", `%${query}%`);
  }

  const { data, error } = await dbQuery.limit(500);

  if (error) {
    return NextResponse.json(
      { error: "Daten konnten nicht geladen werden: " + error.message },
      { status: 500 },
    );
  }

  // Org-Mitgliedschaften laden für B2B-Zuordnung
  const { data: orgMembers } = await admin
    .from("organization_members")
    .select("user_id, org_id, role, organizations(name)")
    .limit(1000);

  const orgMap = new Map<string, { org_name: string; role: string }>();
  if (orgMembers) {
    for (const m of orgMembers) {
      const orgData = m.organizations as unknown as { name: string } | null;
      if (orgData) {
        orgMap.set(m.user_id, { org_name: orgData.name, role: m.role });
      }
    }
  }

  const customers = (data ?? []).map((row) => {
    const org = orgMap.get(row.user_id);
    return {
      ...row,
      org_name: org?.org_name ?? null,
      org_role: org?.role ?? null,
    };
  });

  return NextResponse.json({ customers, total: customers.length });
}
