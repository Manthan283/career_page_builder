// components/JobCard.tsx
import Link from "next/link";

export type Job = {
  id: string;
  title: string;
  slug: string;
  location?: string | null;
  jobType?: string | null;
  description?: string | null;
};

export default function JobCard({
  job,
  companySlug,
}: {
  job: Job;
  companySlug: string;
}) {
  const summary =
    job.description
      ?.replace(/<[^>]+>/g, "")
      .slice(0, 140)
      .trim() || "More details about this role will be added soon.";

  return (
    <article className="group flex items-stretch justify-between gap-4 rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm transition hover:-translate-y-[1px] hover:border-slate-300 hover:shadow-md">
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-semibold text-slate-900">
          <Link
            href={`/${companySlug}/careers/${job.slug}`}
            className="hover:underline"
          >
            {job.title}
          </Link>
        </h3>
        <p className="mt-1 text-xs text-slate-600">
          {job.location || "Remote"}
          {job.jobType ? ` · ${job.jobType}` : ""}
        </p>
        <p className="mt-2 line-clamp-2 text-xs text-slate-500">{summary}</p>
      </div>

      <div className="flex items-center">
        <Link
          href={`/${companySlug}/careers/${job.slug}`}
          className="rounded-full border border-slate-300 px-3 py-1 text-[11px] font-medium text-slate-700 group-hover:border-slate-400 group-hover:text-slate-900"
        >
          View
        </Link>
      </div>
    </article>
  );
}
