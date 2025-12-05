// app/[companySlug]/careers/[jobSlug]/page.tsx
import { prisma } from "@/lib/prisma";
import React from "react";

export default async function JobPage({ params }: { params: { companySlug: string, jobSlug: string }}) {
  const { companySlug, jobSlug } = params;
  const company = await prisma.company.findUnique({ where: { slug: companySlug }, select: { id: true, name: true }});
  if (!company) return <div>Company not found</div>;
  const job = await prisma.job.findFirst({ where: { companyId: company.id, slug: jobSlug }});
  if (!job) return <div>Job not found</div>;

  const structured = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.title,
    datePosted: job.postedAt.toISOString(),
    description: job.description,
    hiringOrganization: { "@type": "Organization", name: company.name },
    jobLocation: job.location ?? "Remote",
  };

  return (
    <main className="container mx-auto p-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structured) }} />
      <h1 className="text-2xl font-semibold mb-2">{job.title}</h1>
      <p className="text-sm text-slate-600 mb-4">{job.location} · {job.jobType}</p>
      <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: job.description }} />
    </main>
  );
}
