import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { requireCompanyAccess } from "@/lib/authz";
import { randomBytes } from "crypto";

type InviteBody = {
  email: string;
  role: "OWNER" | "ADMIN" | "EDITOR" | "VIEWER";
};

export async function POST(
  req: Request,
  ctx: { params: Promise<{ slug: string }> }
) {
  try {
    // ✅ unwrap params (Next 16 + Turbopack requirement)
    const { slug } = await ctx.params;

    if (!slug) {
      return NextResponse.json(
        { error: "Missing company slug" },
        { status: 400 }
      );
    }

    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("Invite API debug", {
      userId: session.user.id,
      email: session.user.email,
      slug,
    });

    await requireCompanyAccess({
      userId: session.user.id,
      companySlug: slug,
      roles: ["OWNER", "ADMIN"],
    });

    const body = (await req.json()) as InviteBody;
    const { email, role } = body;

    if (!email || !role) {
      return NextResponse.json(
        { error: "Email and role are required" },
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

    const existing = await prisma.companyInvite.findFirst({
      where: {
        email,
        companyId: company.id,
        accepted: false,
        expiresAt: { gt: new Date() },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Invite already sent" },
        { status: 409 }
      );
    }

    const token = randomBytes(32).toString("hex");

    const invite = await prisma.companyInvite.create({
      data: {
        email,
        role,
        token,
        companyId: company.id,
        invitedById: session.user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return NextResponse.json({ invite }, { status: 201 });
  } catch (err) {
    console.error("POST /invites error:", err);
    return NextResponse.json(
      { error: "Forbidden or internal error" },
      { status: 403 }
    );
  }
}
