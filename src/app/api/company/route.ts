import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60);
}

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { name, heroText } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    const slug = slugify(name);

    const existing = await prisma.company.findUnique({
      where: { slug },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Company with this name already exists" },
        { status: 409 }
      );
    }

    const company = await prisma.company.create({
      data: {
        name,
        slug,
        heroText: heroText || null,
        description: "",
        branding: {},
        settings: {},
        members: {
          create: {
            userId: session.user.id,
            role: "OWNER",
          },
        },
      },
    });

    return NextResponse.json(company, { status: 201 });
  } catch (err) {
    console.error("POST /api/company error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}