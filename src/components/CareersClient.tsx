"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import useSWR from "swr";
import JobList from "@/components/JobList";
import JobListSkeleton from "@/components/JobListSkeleton";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

type Props = {
  slug: string;
  companyName: string;
  branding: any;
};

/* ---------- debounce hook ---------- */
function useDebouncedValue<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);

  return debounced;
}

/* ---------- helpers ---------- */
function toEmbedUrl(url?: string): string | null {
  if (!url) return null;

  try {
    if (url.includes("youtube.com/watch")) {
      const u = new URL(url);
      const v = u.searchParams.get("v");
      if (v) return `https://www.youtube.com/embed/${v}`;
    }

    if (url.includes("youtu.be/")) {
      const id = url.split("youtu.be/")[1]?.split("?")[0];
      if (id) return `https://www.youtube.com/embed/${id}`;
    }

    if (url.includes("loom.com/share/")) {
      return url.replace("loom.com/share", "loom.com/embed");
    }

    return null;
  } catch {
    return null;
  }
}

export default function CareersClient({
  slug,
  companyName,
  branding,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  /* ---------- state (URL synced) ---------- */
  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const [location, setLocation] = useState(searchParams.get("location") ?? "");
  const [jobType, setJobType] = useState(searchParams.get("type") ?? "");
  const [sort, setSort] = useState(searchParams.get("sort") ?? "latest");

  /* ---------- debounced ---------- */
  const debouncedSearch = useDebouncedValue(search);
  const debouncedLocation = useDebouncedValue(location);

  /* ---------- sync state → URL ---------- */
  useEffect(() => {
    const params = new URLSearchParams();

    if (search) params.set("search", search);
    if (location) params.set("location", location);
    if (jobType) params.set("type", jobType);
    if (sort !== "latest") params.set("sort", sort);

    router.replace(`?${params.toString()}`, { scroll: false });
  }, [search, location, jobType, sort, router]);

  /* ---------- API URL ---------- */
  const jobsUrl = useMemo(() => {
    if (!slug) return null;

    const params = new URLSearchParams();
    if (debouncedSearch.trim()) params.set("search", debouncedSearch.trim());
    if (debouncedLocation.trim()) params.set("location", debouncedLocation.trim());
    if (jobType) params.set("type", jobType);
    if (sort) params.set("sort", sort);

    return `/api/company/${slug}/jobs?${params.toString()}`;
  }, [slug, debouncedSearch, debouncedLocation, jobType, sort]);

  const { data, error, isLoading } = useSWR(jobsUrl, fetcher);
  const jobs = data?.data ?? [];

  const embedUrl = toEmbedUrl(branding?.cultureVideoUrl);

  return (
    <>
      {/* ---------- SEO structured data (Phase 2.3) ---------- */}
      {jobs.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(
              jobs.map((job: any) => ({
                "@context": "https://schema.org",
                "@type": "JobPosting",
                title: job.title,
                description: job.description,
                datePosted: job.postedAt,
                employmentType: job.jobType,
                hiringOrganization: {
                  "@type": "Organization",
                  name: companyName,
                },
                jobLocation: {
                  "@type": "Place",
                  address: {
                    "@type": "PostalAddress",
                    addressLocality: job.location ?? "Remote",
                  },
                },
              }))
            ),
          }}
        />
      )}

      {/* ---------- Filters ---------- */}
      <section className="mb-6 rounded-xl border bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            className="flex-1 rounded border px-3 py-2 text-sm"
            placeholder="Search jobs"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <input
            className="flex-1 rounded border px-3 py-2 text-sm"
            placeholder="Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
          <select
            className="rounded border px-3 py-2 text-sm"
            value={jobType}
            onChange={(e) => setJobType(e.target.value)}
          >
            <option value="">All types</option>
            <option value="Full-time">Full-time</option>
            <option value="Part-time">Part-time</option>
            <option value="Contract">Contract</option>
            <option value="Intern">Intern</option>
          </select>
          {/* 🔽 SORT DROPDOWN (Phase 2.2 frontend) */}
          <select
            className="rounded border px-3 py-2 text-sm"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            <option value="latest">Latest</option>
            <option value="oldest">Oldest</option>
          </select>
        </div>
      </section>

      {/* ---------- Jobs list ---------- */}
      {error ? (
        <div className="rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Failed to load jobs. Please try again.
        </div>
      ) : isLoading ? (
        <JobListSkeleton />
      ) : jobs.length === 0 ? (
        <div className="rounded-xl border border-dashed bg-slate-50 px-6 py-12 text-center">
          <div className="mx-auto mb-3 h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
            📭
          </div>
          <h3 className="text-sm font-semibold text-slate-800">
            No roles match your filters
          </h3>
          <p className="mt-1 text-sm text-slate-600">
            Try adjusting your search or check back later.
          </p>
        </div>
      ) : (
        <JobList jobs={jobs} companySlug={slug} />
      )}

      {/* ---------- Culture video ---------- */}
      {embedUrl && (
        <section className="mt-16">
          <h2 className="text-xl font-semiboldC">
            Life at {companyName}
          </h2>
          <div className="aspect-video overflow-hidden rounded-xl border bg-black shadow">
            <iframe
              src={embedUrl}
              title="Culture video"
              className="w-full h-full"
              allowFullScreen
            />
          </div>
        </section>
      )}
    </>
  );
}
