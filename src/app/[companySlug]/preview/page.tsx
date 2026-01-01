// app/[companySlug]/preview/page.tsx
import React from "react";
import JobList from "@/components/JobList";
import { prisma } from "@/lib/prisma";


type Snapshot = {
  branding?: any;
  jobDraft?: any;
  sectionOrder?: string[];
};


function renderJobDraft(jobDraft: any, sectionOrder: string[] = []) {
  // jobDraft shape: { title, location, jobType, about, what, qualifications, niceToHave, customTitle, customContent, applyLink, applyEmail }
  const responsibilities: string[] = (jobDraft?.what || "")
    .split("\n")
    .map((s: string) => s.trim())
    .filter(Boolean);
  const qualifications: string[] = (jobDraft?.qualifications || "")
    .split("\n")
    .map((s: string) => s.trim())
    .filter(Boolean);
  const niceToHave: string[] = (jobDraft?.niceToHave || "")
    .split("\n")
    .map((s: string) => s.trim())
    .filter(Boolean);

  const defaultOrder = ["aboutRole", "what", "qualifications", "niceToHave", "custom", "howToApply"];
  const order = sectionOrder && sectionOrder.length > 0 ? sectionOrder : defaultOrder;

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-slate-200 bg-white px-4 py-3">
        <h3 className="text-lg font-semibold">{jobDraft?.title || "Untitled role"}</h3>
        <p className="text-sm text-slate-600">{jobDraft?.location || "Remote"}{jobDraft?.jobType ? ` · ${jobDraft.jobType}` : ""}</p>
      </div>

      {order.map((k) => {
        if (k === "aboutRole") {
          return jobDraft?.about ? (
            <section key={k} className="rounded-lg border border-slate-200 bg-white px-4 py-3">
              <h4 className="text-sm font-semibold">About the role</h4>
              <p className="mt-2 text-sm whitespace-pre-line text-slate-700">{jobDraft.about}</p>
            </section>
          ) : null;
        }
        if (k === "what") {
          return responsibilities.length ? (
            <section key={k} className="rounded-lg border border-slate-200 bg-white px-4 py-3">
              <h4 className="text-sm font-semibold">What you'll do</h4>
              <ul className="mt-2 list-disc pl-5 text-sm text-slate-700 space-y-1">{responsibilities.map((r,i)=>(<li key={i}>{r}</li>))}</ul>
            </section>
          ) : null;
        }
        if (k === "qualifications") {
          return qualifications.length ? (
            <section key={k} className="rounded-lg border border-slate-200 bg-white px-4 py-3">
              <h4 className="text-sm font-semibold">Qualifications</h4>
              <ul className="mt-2 list-disc pl-5 text-sm text-slate-700 space-y-1">{qualifications.map((r,i)=>(<li key={i}>{r}</li>))}</ul>
            </section>
          ) : null;
        }
        if (k === "niceToHave") {
          return niceToHave.length ? (
            <section key={k} className="rounded-lg border border-slate-200 bg-white px-4 py-3">
              <h4 className="text-sm font-semibold">Nice to have</h4>
              <ul className="mt-2 list-disc pl-5 text-sm text-slate-700 space-y-1">{niceToHave.map((r,i)=>(<li key={i}>{r}</li>))}</ul>
            </section>
          ) : null;
        }
        if (k === "custom") {
          return jobDraft?.customTitle || jobDraft?.customContent ? (
            <section key={k} className="rounded-lg border border-slate-200 bg-white px-4 py-3">
              <h4 className="text-sm font-semibold">{jobDraft.customTitle || "More about this role"}</h4>
              <p className="mt-2 text-sm text-slate-700 whitespace-pre-line">{jobDraft.customContent}</p>
            </section>
          ) : null;
        }
        if (k === "howToApply") {
          return (jobDraft?.applyLink || jobDraft?.applyEmail) ? (
            <section key={k} className="rounded-lg border border-slate-200 bg-white px-4 py-3">
              <h4 className="text-sm font-semibold">How to apply</h4>
              <div className="mt-2 flex gap-2">
                {jobDraft?.applyLink && <a className="inline-flex items-center rounded-full bg-slate-900 px-4 py-1.5 text-xs font-medium text-white" href={jobDraft.applyLink} target="_blank" rel="noreferrer">Apply on company site</a>}
                {jobDraft?.applyEmail && <a className="inline-flex items-center rounded-full border border-slate-300 bg-white px-4 py-1.5 text-xs font-medium text-slate-800" href={`mailto:${jobDraft.applyEmail}`}>Apply via email</a>}
              </div>
            </section>
          ) : null;
        }
        return null;
      })}
    </div>
  );
}

export default async function PreviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ companySlug: string }>;
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const { companySlug } = await params;

  // If `data` present -> try to decode snapshot (base64 JSON)
  const maybeData = Array.isArray(searchParams?.data) ? searchParams?.data[0] : searchParams?.data;

  let snapshot: Snapshot | null = null;
  if (maybeData) {
    try {
      // server-side decode (Buffer). On client the Editor opens the same encoded string.
      const decoded = Buffer.from(maybeData, "base64").toString("utf8");
      snapshot = JSON.parse(decoded) as Snapshot;
    } catch (e) {
      // ignore and fallback to DB below
      snapshot = null;
    }
  }

  if (snapshot) {
    // Render preview from snapshot (client can open this in a tab using `?data=...`)
    const branding = snapshot.branding ?? {};
    const jobDraft = snapshot.jobDraft ?? null;
    const sectionOrder = Array.isArray(snapshot.sectionOrder) ? snapshot.sectionOrder : [];

    return (
      <div>
        <main className="container mx-auto p-6 max-w-4xl">
          <header>
            <h1 className="text-2xl font-semibold">Preview — {branding?.name ?? companySlug}</h1>
            <p className="mt-2 text-sm text-slate-600">{branding?.heroText}</p>
          </header>

          <section className="mt-6 space-y-6">
            <div className="rounded-lg border border-slate-200 bg-white px-4 py-3">
              <h2 className="text-lg font-semibold">Branding snapshot</h2>
              <div className="mt-3 text-sm text-slate-700">
                <div>Logo: {branding?.logo ? <span className="text-slate-900">provided</span> : <span className="text-slate-500">none</span>}</div>
                <div>Primary color: {branding?.primaryColor ?? "default"}</div>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3">Job draft preview</h2>
              {jobDraft ? renderJobDraft(jobDraft, sectionOrder) : <div className="text-sm text-slate-500">No job draft provided in snapshot.</div>}
            </div>
          </section>
        </main>
      </div>
    );
  }

  // fallback: no snapshot — render DB company + jobs (existing behavior)
  const company = await prisma.company.findUnique({ where: { slug: companySlug }});
  if (!company) return <div className="container mx-auto p-6">Company not found</div>;
  const jobs = await prisma.job.findMany({ where: { companyId: company.id }, orderBy: { postedAt: "desc" }});

  return (
    <div>
      <main className="container mx-auto p-6">
        <header>
          <h1 className="text-2xl font-semibold">Preview — {company.name}</h1>
        </header>

        <section className="mt-6">
          <JobList jobs={jobs} companySlug={companySlug} />
        </section>
      </main>
    </div>
  );
}
