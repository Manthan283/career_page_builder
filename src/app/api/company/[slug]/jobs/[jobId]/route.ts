import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = { params: { slug: string; jobId: string } };

// GET → fetch one job (optional but useful)
export async function GET(request: Request, { params }: Params) {
  const { slug, jobId } = params;

  const job = await prisma.job.findFirst({
    where: {
      id: jobId,
      company: { slug }
    }
  });

  if (!job) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }

  return NextResponse.json({ data: job });
}

// PATCH → update a job
export async function PATCH(request: Request, { params }: Params) {
  const { slug, jobId } = params;

  // Authorization
  const adminHeader = request.headers.get("x-admin-company");
  if (!adminHeader || adminHeader !== slug) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  // Validate fields
  const data: any = {};
  if (body.title) data.title = body.title;
  if (body.location) data.location = body.location;
  if (body.jobType) data.jobType = body.jobType;
  if (body.description) data.description = body.description;
  if (body.responsibilities) data.responsibilities = body.responsibilities;
  if (body.qualifications) data.qualifications = body.qualifications;

  try {
    const updated = await prisma.job.update({
      where: { id: jobId },
      data,
    });

    return NextResponse.json({ data: updated });
  } catch (error: any) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }
}

// DELETE → delete a job
export async function DELETE(request: Request, { params }: Params) {
  const { slug, jobId } = params;

  // Authorization
  const adminHeader = request.headers.get("x-admin-company");
  if (!adminHeader || adminHeader !== slug) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await prisma.job.delete({
      where: { id: jobId },
    });

    return NextResponse.json({ message: "Job deleted" });
  } catch (error: any) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }
}
