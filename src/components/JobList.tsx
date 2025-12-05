import React from "react";
import JobCard, { Job } from "./JobCard";

export default function JobList({ jobs = [], companySlug }: { jobs: Job[]; companySlug: string }) {
  if (!Array.isArray(jobs) || jobs.length === 0) {
    return <div className="p-6 rounded border bg-white text-sm text-slate-600">No open roles right now. Check back soon.</div>;
  }

  return (
    <div className="grid gap-4">
      {jobs.map((job) => (
        <JobCard key={job.id} job={job} companySlug={companySlug} />
      ))}
    </div>
  );
}
