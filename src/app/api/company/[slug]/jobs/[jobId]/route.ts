import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { revalidateCompany } from "@/lib/actions/revalidate";
import { auth } from "@/lib/auth";
import { requireCompanyAccess } from "@/lib/authz";

/* ---------------- schema ---------------- */

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

/* ---------------- GET (PUBLIC) ---------------- */

export async function GET(_: Request, ctx: RouteContext) {
  const { slug, jobId } = await ctx.params;

  const job = await prisma.job.findFirst({
    where: { id: jobId, company: { slug } },
  });

  if (!job) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }

  return NextResponse.json({ data: job });
}

/* ---------------- PATCH (PROTECTED) ---------------- */

export async function PATCH(request: Request, ctx: RouteContext) {
  
  const { slug, jobId } = await ctx.params;
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await requireCompanyAccess({
    userId: session.user.id,
    companySlug: slug,
    roles: ["OWNER", "ADMIN", "EDITOR"],
  });

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

  const updated = await prisma.job.update({
    where: { id: jobId },
    data: parsed.data,
  });

  await revalidateCompany(slug);
  return NextResponse.json({ data: updated });
}

/* ---------------- DELETE (PROTECTED) ---------------- */

export async function DELETE(_: Request, ctx: RouteContext) {
  const { slug, jobId } = await ctx.params;
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await requireCompanyAccess({
    userId: session.user.id,
    companySlug: slug,
    roles: ["OWNER", "ADMIN", "EDITOR"],
  });

  await prisma.job.delete({ where: { id: jobId } });
  await revalidateCompany(slug);

  return NextResponse.json({ message: "Job deleted" });
}
