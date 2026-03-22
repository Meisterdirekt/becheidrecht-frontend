import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { verifyAdmin } from "@/lib/admin-auth";
import { reportError } from "@/lib/error-reporter";

/**
 * GET /api/admin/customers
 *
 * Gibt alle User-Subscriptions zurück (Admin-only).
 * Query-Params: ?status=active&q=suchbegriff
 */

export async function GET(request: NextRequest) {
  const auth = await verifyAdmin(request);
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.error ?? "Kein Admin-Zugang" }, { status: 403 });
  }

  try {
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

    // Subscriptions + Org-Mitgliedschaften parallel laden
    const [subsResult, orgResult] = await Promise.all([
      dbQuery.limit(500),
      admin
        .from("organization_members")
        .select("user_id, org_id, role, organizations(name)")
        .limit(1000),
    ]);

    const { data, error } = subsResult;

    if (error) {
      reportError(new Error(error.message), { context: "admin-customers" });
      return NextResponse.json(
        { error: "Daten konnten nicht geladen werden: " + error.message },
        { status: 500 },
      );
    }

    const orgMembers = orgResult.data;

    const orgMap = new Map<string, { org_name: string; role: string }>();
    if (orgMembers) {
      for (const m of orgMembers) {
        const orgData = m.organizations as unknown as { name: string } | null;
        if (orgData) {
          orgMap.set(m.user_id, { org_name: orgData.name, role: m.role });
        }
      }
    }

    // Last-Login aus auth.users holen (Admin API)
    const lastLoginMap = new Map<string, string | null>();
    const { data: { users: authUsers } } = await admin.auth.admin.listUsers({
      perPage: 1000,
    });
    if (authUsers) {
      for (const u of authUsers) {
        lastLoginMap.set(u.id, u.last_sign_in_at ?? null);
      }
    }

    const customers = (data ?? []).map((row) => {
      const org = orgMap.get(row.user_id);
      return {
        ...row,
        org_name: org?.org_name ?? null,
        org_role: org?.role ?? null,
        last_sign_in_at: lastLoginMap.get(row.user_id) ?? null,
      };
    });

    return NextResponse.json({ customers, total: customers.length });
  } catch (error) {
    reportError(error instanceof Error ? error : new Error(String(error)), { context: "admin-customers" });
    return NextResponse.json({ error: "Kundenliste konnte nicht geladen werden." }, { status: 500 });
  }
}
