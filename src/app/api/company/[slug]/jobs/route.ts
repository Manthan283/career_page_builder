import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { revalidateCompany } from "@/lib/actions/revalidate";

/* ---------------- helpers ---------------- */

async function getSlug(ctx: any) {
  const p = await ctx.params;
  return p?.slug;
}

/* ---------------- schema ---------------- */

const createJobSchema = z.object({
  title: z.string().min(1).max(200),
  location: z.string().max(200).optional().or(z.literal("")),
  jobType: z.string().max(60).optional().or(z.literal("")),
  description: z.string().min(1).max(5000),
  responsibilities: z.array(z.string()).optional(),
  qualifications: z.array(z.string()).optional(),
  metadata: z.any().optional(),
});

/* ---------------- GET ---------------- */

export async function GET(request: Request, ctx: any) {
  const slug = await getSlug(ctx);

  if (!slug) {
    return NextResponse.json(
      { error: "Missing company slug" },
      { status: 400 }
    );
  }

  const company = await prisma.company.findUnique({
    where: { slug },
    select: { id: true },
  });

  if (!company) {
    return NextResponse.json(
      { error: "Company not found" },
      { status: 404 }
    );
  }

  const { searchParams } = new URL(request.url);

  const q = searchParams.get("search") ?? undefined;
  const location = searchParams.get("location") ?? undefined;
  const type = searchParams.get("type") ?? undefined;
  const sort = searchParams.get("sort") ?? "latest";

  const where: any = {
    companyId: company.id,
  };

  if (location) {
    where.location = { contains: location, mode: "insensitive" };
  }

  if (type) {
    where.jobType = type;
  }

  if (q) {
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
    ];
  }

  const orderBy =
    sort === "oldest"
      ? { postedAt: "asc" }
      : { postedAt: "desc" };

  const jobs = await prisma.job.findMany({
    where,
    orderBy,
  });

  return NextResponse.json({ data: jobs });
}


/* ---------------- POST ---------------- */

export async function POST(request: Request, ctx: any) {
  const slug = await getSlug(ctx);

  if (!slug) {
    return NextResponse.json(
      { error: "Missing company slug" },
      { status: 400 }
    );
  }

  const adminHeader = request.headers.get("x-admin-company");
  if (!adminHeader || adminHeader !== slug) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const company = await prisma.company.findUnique({
    where: { slug },
    select: { id: true },
  });

  if (!company) {
    return NextResponse.json(
      { error: "Company not found" },
      { status: 404 }
    );
  }

  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = createJobSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const {
    title,
    location,
    jobType,
    description,
    responsibilities,
    qualifications,
    metadata,
  } = parsed.data;

  const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80);

  const baseSlug = slugify(title);
  let finalSlug = baseSlug;
  let counter = 1;

  // ensure uniqueness per company
  while (
    await prisma.job.findFirst({
      where: {
        companyId: company.id,
        slug: finalSlug,
      },
      select: { id: true },
    })
  ) {
    counter += 1;
    finalSlug = `${baseSlug}-${counter}`;
  }

  const job = await prisma.job.create({
    data: {
      companyId: company.id,
      title,
      slug: finalSlug,
      location: location || null,
      jobType: jobType || null,
      description,
      responsibilities: responsibilities ?? [],
      qualifications: qualifications ?? [],
      metadata: metadata ?? {},
    },
  });

  await revalidateCompany(slug);

  return NextResponse.json({ data: job });
}


