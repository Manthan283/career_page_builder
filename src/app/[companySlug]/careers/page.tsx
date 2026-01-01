// app/[companySlug]/careers/page.tsx
import { prisma } from "@/lib/prisma";
import CareersClient from "@/components/CareersClient";
import React from "react";

export default async function CareersPage({
  params,
}: {
  params: Promise<{ companySlug: string }>;
}) {
  const { companySlug } = await params;

  const company = await prisma.company.findUnique({
    where: { slug: companySlug },
  });

  if (!company) {
    return <div className="container mx-auto p-6">Company not found</div>;
  }

  const branding = (company.branding as any) ?? {};

  const primaryColor = branding.primaryColor || "#0f172a";
  const bannerImage = branding.bannerImage;

  return (
    <div
      className="min-h-screen bg-slate-50"
      style={{ "--brand": primaryColor } as React.CSSProperties}
    >
      

      {/* ---------- HERO ---------- */}
      <section className="relative">
        {bannerImage ? (
          <div
            className="h-56 w-full bg-cover bg-center"
            style={{ backgroundImage: `url(${bannerImage})` }}
          />
        ) : (
          <div
            className="h-56 w-full"
            style={{
              background: "linear-gradient(135deg, var(--brand), #020617)",
            }}
          />
        )}

        <div className="absolute inset-0 flex items-end">
          <div className="container mx-auto px-6 pb-6">
            <div className="flex items-center gap-4">
              {branding.logo ? (
                <div className="h-14 w-14 rounded bg-white p-2 shadow flex items-center justify-center">
                  <img
                    src={branding.logo}
                    alt={`${company.name} logo`}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
              ) : (
                <div className="h-14 w-14 rounded bg-white/90 flex items-center justify-center text-sm font-semibold shadow">
                  {company.name[0]}
                </div>
              )}

              <div className="text-white">
                <h1 className="text-3xl font-semibold">
                  Careers at {company.name}
                </h1>
                <p className="mt-1 text-sm text-white/90 max-w-2xl">
                  {branding.aboutCompany ?? company.description}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- CLIENT ---------- */}
      <main className="container mx-auto p-6 max-w-5xl">
        <CareersClient
          slug={companySlug}
          companyName={company.name}
          branding={branding}
          description={company.description}
        />
      </main>
    </div>
  );
}
