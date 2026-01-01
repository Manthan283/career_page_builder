// app/page.tsx
import Link from "next/link";
import { prisma } from "@/lib/prisma";

// Ensure fresh data (important for SaaS behavior)
export const dynamic = "force-dynamic";

export default async function Home() {
  const companies = await prisma.company.findMany({
  orderBy: { createdAt: "desc" },
  select: {
    id: true,
    name: true,
    heroText: true,
    slug: true,
    description: true,
  },
});

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-5xl px-4 py-12">
        {/* Hero */}
        <header className="mb-10">
          <span className="inline-flex items-center rounded-full bg-slate-900/5 px-3 py-1 text-xs font-medium text-slate-700">
            Careers Platform · Internal Sandbox
          </span>

          <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Build and preview careers pages for your companies.
          </h1>

          <p className="mt-3 max-w-2xl text-sm sm:text-base text-slate-600">
            This environment reflects real companies created via the ATS.
            Use it to open public careers pages or jump into the editor.
          </p>
        </header>

        {/* Companies grid */}
        <section>
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                Companies
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Manage careers pages and job listings
              </p>
          </div>

          <Link
            href="/create-company"
            className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
          >
            + Create company
          </Link>
        </div>


          {companies.length === 0 ? (
            <div className="rounded-lg border border-dashed bg-white p-8 text-center text-sm text-slate-500">
              No companies yet. Create one to get started.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {companies.map((company) => (
                <article
                  key={company.id}
                  className="group relative rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-[1px] hover:shadow-md"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 group-hover:text-slate-950">
                        {company.name}
                      </h3>

                      <p className="mt-1 text-xs font-medium tracking-wide text-slate-500">
                        {company.heroText || "No tagline provided"}
                      </p>
                    </div>

                    <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-medium text-slate-600">
                      Active
                    </span> 
                  </div>

                  {/* Description */}
                  {company.description && (
                    <p className="mt-4 line-clamp-3 text-sm text-slate-600">
                      {company.description}
                    </p>
                  )}

                  {/* Divider */}
                  <div className="my-5 h-px bg-slate-100" />

                  {/* Actions */}
                  <div className="flex items-center justify-between">
                    <Link
                      href={`/${company.slug}/careers`}
                      className="inline-flex items-center gap-2 rounded-md bg-slate-900 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-slate-800"
                    >
                      View careers
                      <span aria-hidden>→</span>
                    </Link>

                    <Link
                      href={`/${company.slug}/edit`}
                      className="inline-flex items-center gap-2 rounded-md bg-slate-100 px-4 py-2 text-xs font-medium text-black transition-colors hover:bg-slate-200"
                    >
                      Open editor
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* Footer */}
        <footer className="mt-10 border-t pt-4 text-xs text-slate-500">
          This environment reflects live database state.
        </footer>
      </div>
    </main>
  );
}
