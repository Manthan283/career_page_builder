"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateCompanyPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function slugify(value: string) {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/company", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          slug: slug || slugify(name),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create company");
      }

      const company = await res.json();

      // Redirect straight to editor
      router.push(`/${company.slug}/edit`);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow">
        <h1 className="text-xl font-semibold">Create company</h1>
        <p className="mt-1 text-sm text-slate-600">
          Set up a new careers page workspace.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Company name
            </label>
            <input
              className="mt-1 w-full rounded border px-3 py-2 text-sm"
              placeholder="Vintera"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setSlug(slugify(e.target.value));
              }}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">
              Company slug
            </label>
            <input
              className="mt-1 w-full rounded border px-3 py-2 text-sm"
              placeholder="vintera"
              value={slug}
              onChange={(e) => setSlug(slugify(e.target.value))}
              required
            />
            <p className="mt-1 text-xs text-slate-500">
              This will be used in the URL: /{slug || "your-company"}
            </p>
          </div>

          {error && (
            <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded bg-slate-900 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
          >
            {loading ? "Creating…" : "Create company"}
          </button>
        </form>
      </div>
    </div>
  );
}
