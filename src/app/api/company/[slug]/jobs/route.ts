import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request, { params }: any) {
  const slug = params.slug;
  const company = await prisma.company.findUnique({ where: { slug }, select: { id: true }});
  if (!company) return NextResponse.json({ error: "Company not found" }, { status: 404 });

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("search") ?? undefined;
  const location = searchParams.get("location") ?? undefined;
  const type = searchParams.get("type") ?? undefined;

  const where: any = { companyId: company.id, isPublished: true };
  if (location) where.location = { contains: location, mode: "insensitive" };
  if (type) where.jobType = type;
  if (q) {
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
    ];
  }

  const jobs = await prisma.job.findMany({
    where,
    orderBy: { postedAt: "desc" },
  });

  return NextResponse.json({ data: jobs });
}

export async function POST(request: Request, { params }: any) {
  // Protected: require x-admin-company header
  const slug = params.slug;
  const adminHeader = (request as any).headers.get("x-admin-company");
  if (!adminHeader || adminHeader !== slug) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const company = await prisma.company.findUnique({ where: { slug }, select: { id: true }});
  if (!company) return NextResponse.json({ error: "Company not found" }, { status: 404 });

  const body = await request.json();
  if (!body.title || !body.description) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  // simple slugify
  const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 80);
  const jobSlug = slugify(body.title);

  const job = await prisma.job.create({
    data: {
      companyId: company.id,
      title: body.title,
      slug: jobSlug,
      location: body.location,
      jobType: body.jobType,
      description: body.description,
      responsibilities: body.responsibilities ?? [],
      qualifications: body.qualifications ?? []
    }
  });

  // revalidate
  try {
    await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/revalidate`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-revalidate-secret": process.env.REVALIDATE_SECRET || "" },
      body: JSON.stringify({ path: `/${slug}/careers` })
    });
  } catch (e) {}

  return NextResponse.json({ data: job });
}
