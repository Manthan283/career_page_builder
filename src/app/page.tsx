// app/page.tsx
import Link from "next/link";

const companies = [
  {
    slug: "vintera",
    name: "Vintera",
    tag: "AI interview prep platform",
    description:
      "Practice interviews, get AI feedback, and help teams hire with confidence.",
    accent: "bg-indigo-50 border-indigo-100",
  },
  {
    slug: "acme-hr",
    name: "Acme HR",
    tag: "Modern ATS for growing teams",
    description:
      "Streamline hiring, track candidates, and collaborate with your team.",
    accent: "bg-emerald-50 border-emerald-100",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-5xl px-4 py-12">
        {/* Hero */}
        <header className="mb-10">
          <span className="inline-flex items-center rounded-full bg-slate-900/5 px-3 py-1 text-xs font-medium text-slate-700">
            Prototype · Careers Page Builder
          </span>

          <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Build and preview careers pages for your companies.
          </h1>

          <p className="mt-3 max-w-2xl text-sm sm:text-base text-slate-600">
            This is your internal sandbox for testing the ATS / careers page
            builder. Use the controls below to open a public careers page or
            jump into the editor for a seed company.
          </p>
        </header>

        {/* Companies grid */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Seed companies
            </h2>
            <p className="text-xs text-slate-500">
              Preloaded: <code>vintera</code>, <code>acme-hr</code>
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {companies.map((company) => (
              <article
                key={company.slug}
                className={`rounded-lg border ${company.accent} p-4 shadow-sm hover:shadow-md transition-shadow`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">
                      {company.name}
                    </h3>
                    <p className="mt-1 text-xs font-medium uppercase tracking-wide text-slate-500">
                      {company.tag}
                    </p>
                    <p className="mt-2 text-sm text-slate-600">
                      {company.description}
                    </p>
                  </div>
                  <span className="rounded-full bg-white px-2 py-1 text-[10px] font-medium text-slate-500 border">
                    {company.slug}
                  </span>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <Link
                    href={`/${company.slug}/careers`}
                    className="inline-flex items-center rounded-md border border-slate-900 bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-800"
                  >
                    View careers page
                  </Link>

                  {/* For now we only expose editor for vintera, but you can enable both */}
                  {company.slug === "vintera" && (
                    <Link
                      href={`/${company.slug}/edit`}
                      className="inline-flex items-center rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
                    >
                      Open editor
                    </Link>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Footer-ish note */}
        <footer className="mt-10 border-t pt-4 text-xs text-slate-500">
          This environment is for prototyping the ATS careers experience. Data
          is seeded locally and may be reset.
        </footer>
      </div>
    </main>
  );
}
