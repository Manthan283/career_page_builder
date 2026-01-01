// app/[companySlug]/careers/[jobSlug]/page.tsx

export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import React from "react";

type SectionKey =
  | "aboutRole"
  | "responsibilities"
  | "qualifications"
  | "niceToHave"
  | "extraSection";

export default async function JobPage(props: {
  params: Promise<{ companySlug: string; jobSlug: string }>;
}) {
  const { companySlug, jobSlug } = await props.params;

  const company = await prisma.company.findUnique({
    where: { slug: companySlug },
    select: { id: true, name: true, description: true, branding: true },
  });
  if (!company) return <div>Company not found</div>;

  const job = await prisma.job.findFirst({
    where: { companyId: company.id, slug: jobSlug },
  });
  if (!job) return <div>Job not found</div>;

  const branding = (company.branding as any) ?? {};
  const metadata = (job.metadata as any) ?? {};

  const responsibilities: string[] = Array.isArray(job.responsibilities)
    ? job.responsibilities.map(String)
    : [];

  const qualifications: string[] = Array.isArray(job.qualifications)
    ? job.qualifications.map(String)
    : [];

  const niceToHave: string[] = Array.isArray(metadata?.niceToHave)
    ? metadata.niceToHave.map(String)
    : [];

  const extraSection: { title?: string; body?: string } | null =
    metadata?.extraSection ?? null;

  const applyUrl =
    typeof metadata?.applyUrl === "string" ? metadata.applyUrl : "";

  const applyEmail =
    typeof metadata?.applyEmail === "string" ? metadata.applyEmail : "";

  const aboutCompanyText =
    branding.aboutCompany ??
    company.description ??
    `Learn more about working at ${company.name}.`;

  const sectionOrder: SectionKey[] = Array.isArray(metadata?.sectionOrder)
    ? metadata.sectionOrder.filter((k: any) =>
        ["aboutRole", "responsibilities", "qualifications", "niceToHave", "extraSection"].includes(k)
      )
    : ["aboutRole", "responsibilities", "qualifications", "niceToHave", "extraSection"];

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
    <div key={jobSlug}>
    <div className="min-h-screen bg-slate-50">

      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structured) }}
        />

        {/* Header */}
        <header className="mb-6">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Job opening
          </p>
          <h1 className="mt-1 text-2xl font-semibold text-slate-900">
            {job.title}
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            {job.location || "Remote"}
            {job.jobType ? ` · ${job.jobType}` : ""}
          </p>
        </header>

        {/* About company (always on top, not reorderable) */}
        <section className="mb-8 rounded-lg border border-slate-200 bg-white px-4 py-3">
          <h2 className="text-sm font-semibold text-slate-800">
            About {company.name}
          </h2>
          <p className="mt-2 text-sm text-slate-600 whitespace-pre-line">
            {aboutCompanyText}
          </p>
        </section>

        {/* Job sections — rendered STRICTLY in saved order */}
        {sectionOrder.map((key) => {
          switch (key) {
            case "aboutRole":
              return (
                <section
                  key={key}
                  className="mb-6 rounded-lg border border-slate-200 bg-white px-4 py-3"
                >
                  <h2 className="text-sm font-semibold text-slate-800">
                    About the role
                  </h2>
                  <p className="mt-2 text-sm text-slate-700 whitespace-pre-line">
                    {job.description}
                  </p>
                </section>
              );

            case "responsibilities":
              return responsibilities.length ? (
                <section
                  key={key}
                  className="mb-6 rounded-lg border border-slate-200 bg-white px-4 py-3"
                >
                  <h2 className="text-sm font-semibold text-slate-800">
                    What you&apos;ll do
                  </h2>
                  <ul className="mt-2 list-disc pl-5 space-y-1 text-sm text-slate-700">
                    {responsibilities.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </section>
              ) : null;

            case "qualifications":
              return qualifications.length ? (
                <section
                  key={key}
                  className="mb-6 rounded-lg border border-slate-200 bg-white px-4 py-3"
                >
                  <h2 className="text-sm font-semibold text-slate-800">
                    Qualifications
                  </h2>
                  <ul className="mt-2 list-disc pl-5 space-y-1 text-sm text-slate-700">
                    {qualifications.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </section>
              ) : null;

            case "niceToHave":
              return niceToHave.length ? (
                <section
                  key={key}
                  className="mb-6 rounded-lg border border-slate-200 bg-white px-4 py-3"
                >
                  <h2 className="text-sm font-semibold text-slate-800">
                    Nice to have
                  </h2>
                  <ul className="mt-2 list-disc pl-5 space-y-1 text-sm text-slate-700">
                    {niceToHave.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </section>
              ) : null;

            case "extraSection":
              return extraSection && (extraSection.title || extraSection.body) ? (
                <section
                  key={key}
                  className="mb-6 rounded-lg border border-slate-200 bg-white px-4 py-3"
                >
                  <h2 className="text-sm font-semibold text-slate-800">
                    {extraSection.title || "More about this role"}
                  </h2>
                  <p className="mt-2 text-sm text-slate-700 whitespace-pre-line">
                    {extraSection.body}
                  </p>
                </section>
              ) : null;

            default:
              return null;
          }
        })}

        {/* How to apply (always last) */}
        {(applyUrl || applyEmail) && (
          <section className="mb-6 rounded-lg border border-slate-200 bg-white px-4 py-3">
            <h2 className="text-sm font-semibold text-slate-800">
              How to apply
            </h2>
            <div className="mt-2 flex flex-wrap gap-2">
              {applyUrl && (
                <a
                  href={applyUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center rounded-full bg-slate-900 px-4 py-1.5 text-xs font-medium text-white hover:bg-slate-800"
                >
                  Apply on company site
                </a>
              )}
              {applyEmail && (
                <a
                  href={`mailto:${applyEmail}`}
                  className="inline-flex items-center rounded-full border border-slate-300 bg-white px-4 py-1.5 text-xs font-medium text-slate-800 hover:bg-slate-50"
                >
                  Apply via email
                </a>
              )}
            </div>
          </section>
        )}
      </main>
    </div>
  </div>
    
  );
}
