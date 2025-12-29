import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

type AcceptInviteBody = {
  token: string;
};

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id || !session.user.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { token } = (await req.json()) as AcceptInviteBody;

    if (!token) {
      return NextResponse.json(
        { error: "Invite token is required" },
        { status: 400 }
      );
    }

    const invite = await prisma.companyInvite.findUnique({
      where: { token },
    });

    if (
      !invite ||
      invite.accepted ||
      invite.expiresAt < new Date()
    ) {
      return NextResponse.json(
        { error: "Invalid or expired invite" },
        { status: 400 }
      );
    }

    // 🔒 Critical security check:
    // invite email must match logged-in user's email
    if (invite.email !== session.user.email) {
      return NextResponse.json(
        { error: "Invite email does not match logged-in user" },
        { status: 403 }
      );
    }

    // Prevent duplicate membership
    const existingMember = await prisma.companyMember.findFirst({
      where: {
        userId: session.user.id,
        companyId: invite.companyId,
      },
    });

    if (!existingMember) {
      await prisma.companyMember.create({
        data: {
          userId: session.user.id,
          companyId: invite.companyId,
          role: invite.role,
        },
      });
    }

    await prisma.companyInvite.update({
      where: { id: invite.id },
      data: { accepted: true },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("POST /invites/accept error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
