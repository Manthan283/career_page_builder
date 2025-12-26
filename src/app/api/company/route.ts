import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, slug } = body;

    if (!name || !slug) {
      return NextResponse.json(
        { error: "Name and slug are required" },
        { status: 400 }
      );
    }

    const existing = await prisma.company.findUnique({
      where: { slug },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Company with this slug already exists" },
        { status: 409 }
      );
    }

    const company = await prisma.company.create({
      data: {
        name,
        slug,
        description: "",
        branding: {},
        settings: {},
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
