import Link from "next/link";
import React from "react";

export type Job = {
  id: string;
  title: string;
  slug: string;
  location?: string | null;
  jobType?: string | null;
  description?: string | null;
};

export default function JobCard({ job, companySlug }: { job: Job; companySlug: string }) {
  return (
    <article className="bg-white border rounded-md p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start gap-4">
        {/* Left: job meta */}
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold leading-snug">
            <Link href={`/${companySlug}/careers/${job.slug}`} className="hover:underline">
              {job.title}
            </Link>
          </h3>

          <p className="mt-1 text-sm text-slate-600 truncate">
            {(job.location ?? "Remote") + (job.jobType ? ` · ${job.jobType}` : "")}
          </p>

          {job.description ? (
            <p className="mt-2 text-sm text-slate-700 line-clamp-3">
              {job.description}
            </p>
          ) : null}
        </div>

        {/* Right: CTA */}
        <div className="flex items-center">
          <Link
            href={`/${companySlug}/careers/${job.slug}`}
            className="inline-flex items-center px-3 py-1.5 border rounded text-sm font-medium hover:bg-slate-50"
            aria-label={`View job ${job.title}`}
          >
            View
          </Link>
        </div>
      </div>
    </article>
  );
}
