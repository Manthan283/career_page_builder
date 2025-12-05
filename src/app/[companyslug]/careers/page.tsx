import { prisma } from "@/lib/prisma";
import JobList from "@/components/JobList";
import React from "react";

export default async function CareersPage({ params }: { params: { companySlug: string }}) {
  const slug = params.companySlug;
  const company = await prisma.company.findUnique({ where: { slug }});
  if (!company) {
    return (
      <main className="container mx-auto p-8">
        <h1>Company not found</h1>
      </main>
    );
  }
  const jobs = await prisma.job.findMany({
    where: { companyId: company.id, isPublished: true },
    orderBy: { postedAt: "desc" },
  });

  const branding = (company.branding ?? {}) as any;

  return (
    <main className="container mx-auto p-6">
      <header className="mb-6">
        <div className="flex items-center gap-4">
          {branding.logo ? <img src={branding.logo} alt={`${company.name} logo`} className="h-12 w-12 object-contain" /> : <div className="h-12 w-12 rounded bg-slate-200" />}
          <div>
            <h1 className="text-2xl font-semibold">{company.name}</h1>
            <p className="text-sm text-slate-600">{company.description}</p>
          </div>
        </div>
      </header>

      <section className="mb-8">
        <h2 className="text-xl font-medium mb-2">Open roles</h2>
        <JobList jobs={jobs} companySlug={slug} />
      </section>

      <section className="mt-12">
        {/* Render about from branding.heroText or company.description */}
        <h3 className="text-lg font-semibold">About</h3>
        <p className="text-sm text-slate-700 mt-2">{branding.heroText ?? company.description}</p>
      </section>
    </main>
  );
}
