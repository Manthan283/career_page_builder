// components/JobList.tsx
import React from "react";
import JobCard, { Job } from "./JobCard";

export default function JobList({
  jobs = [],
  companySlug,
}: {
  jobs: Job[];
  companySlug: string;
}) {
  if (!jobs.length) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
        No open roles right now. Check back soon.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {jobs.map((job) => (
        <JobCard key={job.id} job={job} companySlug={companySlug} />
      ))}
    </div>
  );
}
