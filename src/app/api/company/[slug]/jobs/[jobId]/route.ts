import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { revalidateCompany } from "@/lib/actions/revalidate";

const updateJobSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  location: z.string().max(200).optional().or(z.literal("")),
  jobType: z.string().max(60).optional().or(z.literal("")),
  description: z.string().min(1).max(5000).optional(),
  responsibilities: z.array(z.string()).optional(),
  qualifications: z.array(z.string()).optional(),
  metadata: z.any().optional(),
});

type RouteContext = {
  params: Promise<{ slug: string; jobId: string }>;
};

/* ---------------- GET ---------------- */

export async function GET(request: Request, ctx: RouteContext) {
  const { slug, jobId } = await ctx.params;

  const job = await prisma.job.findFirst({
    where: {
      id: jobId,
      company: { slug },
    },
  });

  if (!job) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }

  return NextResponse.json({ data: job });
}

/* ---------------- PATCH ---------------- */

export async function PATCH(request: Request, ctx: RouteContext) {
  const { slug, jobId } = await ctx.params;

  const adminHeader = request.headers.get("x-admin-company");
  if (!adminHeader || adminHeader !== slug) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = updateJobSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const p = parsed.data;
  const data: any = {};

  if (p.title !== undefined) data.title = p.title;
  if (p.location !== undefined) data.location = p.location || null;
  if (p.jobType !== undefined) data.jobType = p.jobType || null;
  if (p.description !== undefined) data.description = p.description;
  if (p.responsibilities !== undefined)
    data.responsibilities = p.responsibilities;
  if (p.qualifications !== undefined)
    data.qualifications = p.qualifications;
  if (p.metadata !== undefined) data.metadata = p.metadata;

  try {
    const updated = await prisma.job.update({
      where: { id: jobId },
      data,
    });

    try {
      await revalidateCompany(slug);
    } catch {}

    return NextResponse.json({ data: updated });
  } catch {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }
}

/* ---------------- DELETE ---------------- */

export async function DELETE(request: Request, ctx: RouteContext) {
  const { slug, jobId } = await ctx.params;

  const adminHeader = request.headers.get("x-admin-company");
  if (!adminHeader || adminHeader !== slug) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await prisma.job.delete({ where: { id: jobId } });

    try {
      await revalidateCompany(slug);
    } catch {}

    return NextResponse.json({ message: "Job deleted" });
  } catch {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }
}
