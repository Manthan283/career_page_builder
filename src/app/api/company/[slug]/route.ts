import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { revalidateCompany } from "@/lib/actions/revalidate";

const sectionSchema = z.object({
  id: z.string(), // client-generated
  kind: z.enum(["about", "life", "benefits", "custom"]),
  title: z.string().min(1).max(80),
  body: z.string().min(1).max(3000),
});

const brandingSchema = z.object({
  logo: z.string().url().optional().or(z.literal("")),
  primaryColor: z.string().optional(),
  heroText: z.string().max(300).optional(),
  bannerImage: z.string().url().optional().or(z.literal("")),
  cultureVideoUrl: z.string().url().optional().or(z.literal("")),
  sections: z.array(sectionSchema).optional(),
});

const settingsSchema = z.object({}).passthrough();

const companyUpdateSchema = z.object({
  branding: brandingSchema.optional(),
  settings: settingsSchema.optional(),
});

// helper: works whether ctx.params is object or Promise
async function getSlug(ctx: any) {
  const p = await ctx.params;
  return p?.slug;
}

// GET: used by editor + anywhere else
export async function GET(req: NextRequest, ctx: any) {
  try {
    const slug = await getSlug(ctx);

    if (!slug) {
      return NextResponse.json(
        { error: "Missing company slug in route params" },
        { status: 400 }
      );
    }

    const company = await prisma.company.findUnique({
      where: { slug },
    });

    if (!company) {
      return NextResponse.json(
        { error: "Company not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: company });
  } catch (err: any) {
    console.error("GET /api/company/[slug] error:", err);
    return NextResponse.json(
      { error: "Internal error in company GET" },
      { status: 500 }
    );
  }
}

// PATCH: update branding/settings (no auth for now)
export async function PATCH(req: NextRequest, ctx: any) {
  try {
    const slug = await getSlug(ctx);

    if (!slug) {
      return NextResponse.json(
        { error: "Missing company slug in route params" },
        { status: 400 }
      );
    }

    const json = await req.json().catch(() => null);
    if (!json) {
      return NextResponse.json(
        { error: "Invalid JSON body" },
        { status: 400 }
      );
    }

    const parsed = companyUpdateSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.format() },
        { status: 400 }
      );
    }

    const { branding, settings } = parsed.data;
    if (!branding && !settings) {
      return NextResponse.json(
        { error: "No updatable fields provided" },
        { status: 400 }
      );
    }

    const company = await prisma.company.update({
      where: { slug },
      data: {
        ...(branding ? { branding: branding as Prisma.InputJsonValue } : {}),
        ...(settings ? { settings: settings as Prisma.InputJsonValue } : {}),
      },
    });

    await revalidateCompany(slug);

    return NextResponse.json({ data: company });
  } catch (err: any) {
    console.error("PATCH /api/company/[slug] error:", err);
    return NextResponse.json(
      { error: "Internal error in company PATCH" },
      { status: 500 }
    );
  }
}
