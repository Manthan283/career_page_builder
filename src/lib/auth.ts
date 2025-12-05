// lib/auth.ts
import type { NextRequest } from "next/server";

/**
 * Very small auth stub: checks for header "x-admin-company"
 * Value should be the company slug (only for prototype/demo).
 *
 * For real app: use NextAuth/JWT + roles + company_admin table.
 */
export async function requireAdmin(req: NextRequest) {
  const adminHeader = req.headers.get("x-admin-company");
  if (!adminHeader) {
    return { ok: false, status: 401, message: "Missing admin header" };
  }
  // In prototype, accept any non-empty header as admin for that company slug
  return { ok: true, companySlug: adminHeader };
}
