// app/api/company/[slug]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function GET(request: Request, { params }: any) {
  const slug = params.slug;
  const company = await prisma.company.findUnique({
    where: { slug },
  });
  if (!company) return NextResponse.json({ error: "Company not found" }, { status: 404 });
  return NextResponse.json({ data: company });
}

export async function PATCH(request: Request, { params }: any) {
  const slug = params.slug;
  // stub auth: NextRequest -> Request lacks headers in this signature, so read from fetch
  // We'll parse JSON and allow call only if x-admin-company is present in request headers
  const req = request as any;
  // We can't access headers via request in the same way in app router — we use Request.headers
  const adminHeader = req.headers.get("x-admin-company");
  if (!adminHeader || adminHeader !== slug) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const data: any = {};
  if (body.branding) data.branding = body.branding;
  if (body.settings) data.settings = body.settings;
  if (Object.keys(data).length === 0) return NextResponse.json({ error: "No fields" }, { status: 400 });

  const company = await prisma.company.update({
    where: { slug },
    data,
  });

  // trigger ISR revalidate (call our revalidate endpoint)
  try {
    await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/revalidate`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-revalidate-secret": process.env.REVALIDATE_SECRET || "" },
      body: JSON.stringify({ path: `/${slug}/careers` })
    });
  } catch (e) {
    // ignore
  }

  return NextResponse.json({ data: company });
}
