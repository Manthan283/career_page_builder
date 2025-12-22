"use client";

import React, { useEffect, useState } from "react";
import useSWR from "swr";
import JobList from "@/components/JobList"; // used in preview
import Navbar from "@/components/Navbar"; // optional, used inside modal for fidelity

/* ========================================================= */
/* UI PRIMITIVES (Option 2 SaaS STRUCTURE)                    */
/* ========================================================= */

function TopBar({
  slug,
  onPreview,
}: {
  slug: string;
  onPreview: () => void;
}) {
  return (
    <div className="sticky top-0 z-40 border-b bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <div>
          <h1 className="text-sm font-semibold">Editor · {slug}</h1>
          <p className="text-xs text-slate-500">Draft mode</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onPreview}
            className="rounded-md border px-3 py-1.5 text-xs hover:bg-slate-50"
          >
            Preview
          </button>
          <a
            href={`/${slug}/careers`}
            target="_blank"
            rel="noreferrer"
            className="rounded-md bg-slate-900 px-3 py-1.5 text-xs text-white"
          >
            Public page →
          </a>
        </div>
      </div>
    </div>
  );
}

type EditorSection = "branding" | "createJob" | "roles";


interface SidebarProps {
  active: EditorSection;
  onChange: (section: EditorSection) => void;
}


function Sidebar({ active, onChange }: SidebarProps) {
  return (
    <aside className="w-56 border-r bg-white px-3 py-4 space-y-1">
      <p className="px-2 text-xs font-semibold text-slate-500 mb-2">
        Company
      </p>

      <button
        onClick={() => onChange("branding")}
        className={`w-full text-left px-3 py-2 rounded text-sm transition ${
          active === "branding"
            ? "bg-slate-900 text-white"
            : "hover:bg-slate-100"
        }`}
      >
        Branding
      </button>

      <p className="px-2 text-xs font-semibold text-slate-500 mt-4 mb-2">
        Jobs
      </p>

      <button
        onClick={() => onChange("createJob")}
        className={`w-full text-left px-3 py-2 rounded text-sm transition ${
          active === "createJob"
            ? "bg-slate-900 text-white"
            : "hover:bg-slate-100"
        }`}
      >
        Create job
      </button>

      <button
        onClick={() => onChange("roles")}
        className={`w-full text-left px-3 py-2 rounded text-sm transition ${
          active === "roles"
            ? "bg-slate-900 text-white"
            : "hover:bg-slate-100"
        }`}
      >
        Existing roles
      </button>
    </aside>
  );
}


function Card({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border bg-white p-4">
      <h2 className="text-sm font-semibold">{title}</h2>
      {description && (
        <p className="mt-1 text-xs text-slate-500">{description}</p>
      )}
      <div className="mt-4 space-y-3">{children}</div>
    </section>
  );
}

/* ========================================================= */

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const DEFAULT_SECTION_ORDER = [
  "aboutRole",
  "responsibilities",
  "qualifications",
  "niceToHave",
  "extraSection",
] as const;
type SectionKey = (typeof DEFAULT_SECTION_ORDER)[number];

function splitLines(text: string): string[] {
  return text
    .split(/\r?\n/)
    .map((s) => s.trim().replace(/^•\s*/, ""))
    .filter(Boolean);
}

function moveSection(order: SectionKey[], key: SectionKey, dir: "up" | "down") {
  const idx = order.indexOf(key);
  if (idx === -1) return order;
  const nextIdx = dir === "up" ? idx - 1 : idx + 1;
  if (nextIdx < 0 || nextIdx >= order.length) return order;
  const copy = [...order];
  const [item] = copy.splice(idx, 1);
  copy.splice(nextIdx, 0, item);
  return copy;
}

function toEmbedUrl(url?: string): string | null {
  if (!url) return null;

  try {
    // YouTube long URL
    if (url.includes("youtube.com/watch")) {
      const u = new URL(url);
      const v = u.searchParams.get("v");
      if (v) return `https://www.youtube.com/embed/${v}`;
    }

    // YouTube short URL
    if (url.includes("youtu.be/")) {
      const id = url.split("youtu.be/")[1]?.split("?")[0];
      if (id) return `https://www.youtube.com/embed/${id}`;
    }

    // Loom
    if (url.includes("loom.com/share/")) {
      return url.replace("loom.com/share", "loom.com/embed");
    }

    return null;
  } catch {
    return null;
  }
}

export default function EditorPageClient({
  params,
}: {
  params: { companySlug: string };
}) {
  const slug = params.companySlug;

  const companyUrl = slug ? `/api/company/${slug}` : null;
  const jobsUrl = slug ? `/api/company/${slug}/jobs` : null;

  const {
    data: companyData,
    mutate: mutateCompany,
    isLoading: companyLoading,
  } = useSWR(companyUrl, fetcher);


  const [activeSection, setActiveSection] = useState<EditorSection>("branding");

  const {
    data: jobsData,
    mutate: mutateJobs,
    isLoading: jobsLoading,
  } = useSWR(jobsUrl, fetcher);

  const [branding, setBranding] = useState<any>({});
  const [showBrandingPreview, setShowBrandingPreview] = useState(false);

  // New job form – structured + section order
  const [newJob, setNewJob] = useState({
    title: "",
    location: "",
    jobType: "Full-time",
    aboutRole: "",
    responsibilitiesText: "",
    qualificationsText: "",
    niceToHaveText: "",
    extraSectionTitle: "",
    extraSectionBody: "",
    applyUrl: "",
    applyEmail: "",
    sectionOrder: [...DEFAULT_SECTION_ORDER] as SectionKey[],
  });

  // Editing job state – same shape as newJob
  const [editingJob, setEditingJob] = useState<any | null>(null);
  const [editFields, setEditFields] = useState({ ...newJob });
  const [savingEdit, setSavingEdit] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (companyData?.data) {
      setBranding(companyData.data.branding ?? {});
    }
  }, [companyData]);

  async function saveBranding() {
    if (!slug) return;
    const resp = await fetch(`/api/company/${slug}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        // dev header not required for branding but harmless
        "x-admin-company": slug,
      },
      body: JSON.stringify({ branding }),
    });
    if (!resp.ok) {
      console.error("Branding save failed", await resp.text());
    }
    await mutateCompany();
  }

  async function createJob() {
    if (!slug) return;
    if (!newJob.title.trim() || !newJob.aboutRole.trim()) return;

    const responsibilities = splitLines(newJob.responsibilitiesText);
    const qualifications = splitLines(newJob.qualificationsText);
    const niceToHave = splitLines(newJob.niceToHaveText);

    const metadata: any = { sectionOrder: newJob.sectionOrder };
    if (niceToHave.length) metadata.niceToHave = niceToHave;
    if (newJob.extraSectionTitle || newJob.extraSectionBody) {
      metadata.extraSection = {
        title: newJob.extraSectionTitle || "More about this role",
        body: newJob.extraSectionBody,
      };
    }
    if (newJob.applyUrl.trim()) metadata.applyUrl = newJob.applyUrl.trim();
    if (newJob.applyEmail.trim()) metadata.applyEmail = newJob.applyEmail.trim();

    const resp = await fetch(`/api/company/${slug}/jobs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-admin-company": slug, // DEV AUTH header (temporary)
      },
      body: JSON.stringify({
        title: newJob.title,
        location: newJob.location,
        jobType: newJob.jobType,
        description: newJob.aboutRole,
        responsibilities,
        qualifications,
        metadata,
      }),
    });

    if (!resp.ok) {
      const txt = await resp.text();
      console.error("Create job failed", resp.status, txt);
      // optionally show UI error
      return;
    }

    setNewJob({
      title: "",
      location: "",
      jobType: "Full-time",
      aboutRole: "",
      responsibilitiesText: "",
      qualificationsText: "",
      niceToHaveText: "",
      extraSectionTitle: "",
      extraSectionBody: "",
      applyUrl: "",
      applyEmail: "",
      sectionOrder: [...DEFAULT_SECTION_ORDER],
    });
    await mutateJobs();
  }

  function startEdit(job: any) {
    const metadata = (job.metadata ?? {}) as any;

    const responsibilities = Array.isArray(job.responsibilities)
      ? (job.responsibilities as any[]).map(String).join("\n")
      : "";
    const qualifications = Array.isArray(job.qualifications)
      ? (job.qualifications as any[]).map(String).join("\n")
      : "";
    const niceToHave = Array.isArray(metadata.niceToHave)
      ? (metadata.niceToHave as any[]).map(String).join("\n")
      : "";

    const orderFromMeta = Array.isArray(metadata.sectionOrder)
      ? metadata.sectionOrder.filter((k: any) =>
          (DEFAULT_SECTION_ORDER as readonly string[]).includes(k)
        )
      : null;

    const finalOrder: SectionKey[] = orderFromMeta?.length
      ? (orderFromMeta as SectionKey[])
      : [...DEFAULT_SECTION_ORDER];

    setEditingJob(job);
    setEditFields({
      title: job.title ?? "",
      location: job.location ?? "",
      jobType: job.jobType ?? "Full-time",
      aboutRole: job.description ?? "",
      responsibilitiesText: responsibilities,
      qualificationsText: qualifications,
      niceToHaveText: niceToHave,
      extraSectionTitle: metadata.extraSection?.title ?? "",
      extraSectionBody: metadata.extraSection?.body ?? "",
      applyUrl: typeof metadata.applyUrl === "string" ? metadata.applyUrl : "",
      applyEmail:
        typeof metadata.applyEmail === "string" ? metadata.applyEmail : "",
      sectionOrder: finalOrder,
    });
  }

  async function saveEdit() {
    if (!slug || !editingJob) return;
    setSavingEdit(true);

    const responsibilities = splitLines(editFields.responsibilitiesText);
    const qualifications = splitLines(editFields.qualificationsText);
    const niceToHave = splitLines(editFields.niceToHaveText);

    const metadata: any = { sectionOrder: editFields.sectionOrder };
    if (niceToHave.length) metadata.niceToHave = niceToHave;
    if (editFields.extraSectionTitle || editFields.extraSectionBody) {
      metadata.extraSection = {
        title: editFields.extraSectionTitle || "More about this role",
        body: editFields.extraSectionBody,
      };
    }
    if (editFields.applyUrl.trim()) metadata.applyUrl = editFields.applyUrl.trim();
    if (editFields.applyEmail.trim()) metadata.applyEmail = editFields.applyEmail.trim();

    try {
      const resp = await fetch(`/api/company/${slug}/jobs/${editingJob.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-admin-company": slug, // DEV AUTH header
        },
        body: JSON.stringify({
          title: editFields.title,
          location: editFields.location,
          jobType: editFields.jobType,
          description: editFields.aboutRole,
          responsibilities,
          qualifications,
          metadata,
        }),
      });
      if (!resp.ok) {
        console.error("Save edit failed", resp.status, await resp.text());
      }
      setEditingJob(null);
      await mutateJobs();
    } finally {
      setSavingEdit(false);
    }
  }

  async function deleteJob(id: string) {
    if (!slug) return;
    const ok = window.confirm("Are you sure you want to delete this role?");
    if (!ok) return;
    setDeletingId(id);
    try {
      const resp = await fetch(`/api/company/${slug}/jobs/${id}`, {
        method: "DELETE",
        headers: {
          "x-admin-company": slug, // DEV AUTH header
        },
      });
      if (!resp.ok) {
        console.error("Delete failed", resp.status, await resp.text());
      }
      await mutateJobs();
    } finally {
      setDeletingId(null);
    }
  }

  if (!slug) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center text-sm text-slate-600">
          Missing company slug in route.
        </div>
      </div>
    );
  }

  const jobs = jobsData?.data ?? [];
  const companyName = companyData?.data?.name ?? slug;
  const previewEmbedUrl = toEmbedUrl(branding.cultureVideoUrl);


  return (
  <div className="min-h-screen bg-slate-50">
    <TopBar slug={slug} onPreview={() => setShowBrandingPreview(true)} />

    <div className="mx-auto flex max-w-7xl">
      <Sidebar
    active={activeSection}
    onChange={setActiveSection}
  />

      <main className="flex-1 px-4 py-6 space-y-6">
        {/* ================= Branding ================= */}
        {activeSection === "branding" && (
        <Card
          title="Branding"
          description="Public appearance of your careers page"
        >
          {/* Header (moved from old top section) */}
          <div className="mb-4">
            <h1 className="text-2xl font-semibold">Editor · {slug}</h1>
            <p className="text-sm text-slate-600">
              Manage branding and open roles for this company.
            </p>

            
          </div>

          {/* Branding form */}
          <div className="space-y-3">
            <label className="block text-sm">Logo URL</label>
            <input
              className="border p-2 w-full text-sm rounded"
              value={branding.logo ?? ""}
              onChange={(e) =>
                setBranding({ ...branding, logo: e.target.value })
              }
            />

            <label className="block text-sm">About company (hero text)</label>
            <textarea
              className="border p-2 w-full text-sm rounded min-h-[80px]"
              placeholder="Tell candidates who you are, your mission, and what it's like to work with you."
              value={branding.heroText ?? ""}
              onChange={(e) =>
                setBranding({ ...branding, heroText: e.target.value })
              }
            />

            <label className="block text-sm">Primary color (hex)</label>
            <input
              className="border p-2 w-full text-sm rounded"
              placeholder="#111827"
              value={branding.primaryColor ?? ""}
              onChange={(e) =>
                setBranding({ ...branding, primaryColor: e.target.value })
              }
            />

            <label className="block text-sm">Banner image URL</label>
            <input
              className="border p-2 w-full text-sm rounded"
              placeholder="https://…"
              value={branding.bannerImage ?? ""}
              onChange={(e) =>
                setBranding({ ...branding, bannerImage: e.target.value })
              }
            />

            <label className="block text-sm">
              Culture video URL
            </label>
            <input
              className="border p-2 w-full text-sm rounded"
              placeholder="https://www.youtube.com/watch?v=…"
              value={branding.cultureVideoUrl ?? ""}
              onChange={(e) =>
                setBranding({
                  ...branding,
                  cultureVideoUrl: e.target.value,
                })
              }
            />

            <button
              onClick={saveBranding}
              className="mt-3 inline-flex rounded bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
            >
              Save branding
            </button>
          </div>

          
        </Card>
        )}

        {/* ================= Create Job ================= */}
{activeSection === "createJob" && (
<Card
  title="Create job"
  description="Define role content and structure"
>
  {/* Section ordering controls */}
  <div className="mt-3 rounded border bg-slate-50 p-3">
    <p className="text-[11px] font-medium text-slate-700 mb-2">
      Section order (for job pages)
    </p>

    <div className="flex flex-wrap gap-2">
      {newJob.sectionOrder.map((key) => {
        const labelMap: Record<SectionKey, string> = {
          aboutRole: "About the role",
          responsibilities: "What you'll do",
          qualifications: "Qualifications",
          niceToHave: "Nice to have",
          extraSection: "Custom section",
        };

        return (
          <div
            key={key}
            className="inline-flex items-center gap-1 rounded-full border bg-white px-2 py-1 text-[11px]"
          >
            <span>{labelMap[key]}</span>
            <button
              type="button"
              className="px-1 text-slate-500 hover:text-slate-900"
              onClick={() =>
                setNewJob((prev) => ({
                  ...prev,
                  sectionOrder: moveSection(prev.sectionOrder, key, "up"),
                }))
              }
            >
              ↑
            </button>
            <button
              type="button"
              className="px-1 text-slate-500 hover:text-slate-900"
              onClick={() =>
                setNewJob((prev) => ({
                  ...prev,
                  sectionOrder: moveSection(prev.sectionOrder, key, "down"),
                }))
              }
            >
              ↓
            </button>
          </div>
        );
      })}
    </div>
  </div>

  {/* ================= New Job Form ================= */}
  <div className="mt-4 space-y-3">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
      <input
        className="border p-2 text-sm rounded"
        placeholder="Title"
        value={newJob.title}
        onChange={(e) =>
          setNewJob({ ...newJob, title: e.target.value })
        }
      />
      <input
        className="border p-2 text-sm rounded"
        placeholder="Location"
        value={newJob.location}
        onChange={(e) =>
          setNewJob({ ...newJob, location: e.target.value })
        }
      />
      <select
        className="border p-2 text-sm rounded"
        value={newJob.jobType}
        onChange={(e) =>
          setNewJob({ ...newJob, jobType: e.target.value })
        }
      >
        <option>Full-time</option>
        <option>Part-time</option>
        <option>Contract</option>
        <option>Intern</option>
      </select>
    </div>

    <div>
      <label className="block text-xs font-medium text-slate-700 mb-1">
        About the role
      </label>
      <textarea
        className="w-full border p-2 text-sm rounded min-h-[70px]"
        placeholder="Short description of the role."
        value={newJob.aboutRole}
        onChange={(e) =>
          setNewJob({ ...newJob, aboutRole: e.target.value })
        }
      />
    </div>

    <div>
      <label className="block text-xs font-medium text-slate-700 mb-1">
        What you'll do
      </label>
      <textarea
        className="w-full border p-2 text-sm rounded min-h-[70px]"
        placeholder={"One bullet per line, e.g.\n• Build features\n• Partner with design"}
        value={newJob.responsibilitiesText}
        onChange={(e) =>
          setNewJob({
            ...newJob,
            responsibilitiesText: e.target.value,
          })
        }
      />
    </div>

    <div>
      <label className="block text-xs font-medium text-slate-700 mb-1">
        Qualifications
      </label>
      <textarea
        className="w-full border p-2 text-sm rounded min-h-[70px]"
        placeholder={"One bullet per line, e.g.\n• 3+ years in frontend\n• Experience with React"}
        value={newJob.qualificationsText}
        onChange={(e) =>
          setNewJob({
            ...newJob,
            qualificationsText: e.target.value,
          })
        }
      />
    </div>

    <div>
      <label className="block text-xs font-medium text-slate-700 mb-1">
        Nice to have
      </label>
      <textarea
        className="w-full border p-2 text-sm rounded min-h-[60px]"
        placeholder="Optional extras, one per line."
        value={newJob.niceToHaveText}
        onChange={(e) =>
          setNewJob({
            ...newJob,
            niceToHaveText: e.target.value,
          })
        }
      />
    </div>

    <div className="grid grid-cols-1 gap-2">
      <div>
        <label className="block text-xs font-medium text-slate-700 mb-1">
          Custom section title
        </label>
        <input
          className="border p-2 text-sm rounded w-full"
          placeholder="For example: How we work"
          value={newJob.extraSectionTitle}
          onChange={(e) =>
            setNewJob({
              ...newJob,
              extraSectionTitle: e.target.value,
            })
          }
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-700 mb-1">
          Custom section content
        </label>
        <textarea
          className="w-full border p-2 text-sm rounded min-h-[60px]"
          placeholder="Describe anything else you'd like candidates to know."
          value={newJob.extraSectionBody}
          onChange={(e) =>
            setNewJob({
              ...newJob,
              extraSectionBody: e.target.value,
            })
          }
        />
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
      <input
        className="border p-2 text-sm rounded"
        placeholder="https://company.com/jobs/apply/123"
        value={newJob.applyUrl}
        onChange={(e) =>
          setNewJob({ ...newJob, applyUrl: e.target.value })
        }
      />
      <input
        className="border p-2 text-sm rounded"
        placeholder="talent@company.com"
        value={newJob.applyEmail}
        onChange={(e) =>
          setNewJob({ ...newJob, applyEmail: e.target.value })
        }
      />
    </div>

    <button
      onClick={createJob}
      className="mt-3 bg-green-600 px-3 py-1.5 text-xs font-medium text-white rounded hover:bg-green-700"
    >
      Create job
    </button>
  </div>

  {/* ================= Draft Preview ================= */}
  <div className="mt-6 rounded border bg-slate-50 p-4">
    <h3 className="text-sm font-semibold mb-2">Job draft preview</h3>

    {!newJob.title && !newJob.aboutRole ? (
      <p className="text-xs text-slate-500">
        Fill in the job form above to see a preview.
      </p>
    ) : (
      <div className="bg-white rounded border p-4">
        <h4 className="text-lg font-semibold">
          {newJob.title || "Job title"}
        </h4>
        <p className="mt-1 text-xs text-slate-600">
          {(newJob.location || "Location") +
            " · " +
            (newJob.jobType || "Type")}
        </p>

        {newJob.sectionOrder.map((key) => {
          switch (key) {
            case "aboutRole":
              return newJob.aboutRole ? (
                <section key={key} className="mt-4">
                  <h5 className="text-sm font-semibold mb-1">
                    About the role
                  </h5>
                  <p className="text-sm whitespace-pre-line">
                    {newJob.aboutRole}
                  </p>
                </section>
              ) : null;
            default:
              return null;
          }
        })}
      </div>
    )}
  </div>
</Card>
)}

        {/* ================= Existing Roles ================= */}
{activeSection === "roles" && (
<Card title="Existing roles">
  {jobsLoading || companyLoading ? (
    <p className="text-sm text-slate-500">Loading…</p>
  ) : !jobs.length ? (
    <p className="text-sm text-slate-500">
      No roles yet. Create your first job above.
    </p>
  ) : (
    <ul className="space-y-2">
      {jobs.map((j: any) => (
        <li
          key={j.id}
          className="p-3 rounded border bg-white flex justify-between items-start"
        >
          <div>
            <div className="font-semibold text-sm">{j.title}</div>
            <div className="text-xs text-slate-600">
              {j.location || "Remote"} · {j.jobType || "Role type"}
            </div>
          </div>

          <div className="flex flex-col items-end gap-1">
            <a
              className="text-xs text-blue-600"
              href={`/${slug}/careers/${j.slug}`}
              target="_blank"
              rel="noreferrer"
            >
              View
            </a>

            <button
              className="text-xs text-slate-700 hover:underline"
              onClick={() => startEdit(j)}
            >
              Edit
            </button>

            <button
              className="text-xs text-red-600 hover:underline disabled:opacity-50"
              disabled={deletingId === j.id}
              onClick={() => deleteJob(j.id)}
            >
              {deletingId === j.id ? "Deleting…" : "Delete"}
            </button>
          </div>
        </li>
      ))}
    </ul>
  )}
</Card>
)}
</main>

{/* Edit job modal */}
      {editingJob && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-2xl rounded-lg bg-white p-4 shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold">Edit role – {editingJob.title}</h3>
              <button className="text-xs text-slate-500 hover:text-slate-800" onClick={() => setEditingJob(null)}>✕</button>
            </div>

            <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <input className="w-full rounded border px-2 py-1.5 text-sm" placeholder="Title" value={editFields.title} onChange={(e) => setEditFields({ ...editFields, title: e.target.value })} />
                <input className="w-full rounded border px-2 py-1.5 text-sm" placeholder="Location" value={editFields.location} onChange={(e) => setEditFields({ ...editFields, location: e.target.value })} />
                <select className="w-full rounded border px-2 py-1.5 text-sm" value={editFields.jobType} onChange={(e) => setEditFields({ ...editFields, jobType: e.target.value })}>
                  <option>Full-time</option>
                  <option>Part-time</option>
                  <option>Contract</option>
                  <option>Intern</option>
                </select>
              </div>

              {/* Reorder controls for edit mode */}
              <div className="rounded border bg-slate-50 p-2">
                <p className="text-[11px] font-medium text-slate-700 mb-1">Section order</p>
                <div className="flex flex-wrap gap-2">
                  {editFields.sectionOrder.map((key) => {
                    const labelMap: Record<SectionKey, string> = {
                      aboutRole: "About the role",
                      responsibilities: "What you'll do",
                      qualifications: "Qualifications",
                      niceToHave: "Nice to have",
                      extraSection: "Custom section",
                    };
                    return (
                      <div key={key} className="inline-flex items-center gap-1 rounded-full border bg-white px-2 py-1 text-[11px]">
                        <span>{labelMap[key]}</span>
                        <button type="button" className="px-1 text-slate-500 hover:text-slate-900" onClick={() => setEditFields((prev) => ({ ...prev, sectionOrder: moveSection(prev.sectionOrder, key, "up") }))}>↑</button>
                        <button type="button" className="px-1 text-slate-500 hover:text-slate-900" onClick={() => setEditFields((prev) => ({ ...prev, sectionOrder: moveSection(prev.sectionOrder, key, "down") }))}>↓</button>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">About the role</label>
                <textarea className="w-full rounded border px-2 py-1.5 text-sm min-h-[70px]" value={editFields.aboutRole} onChange={(e) => setEditFields({ ...editFields, aboutRole: e.target.value })} />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">What you'll do</label>
                <textarea className="w-full rounded border px-2 py-1.5 text-sm min-h-[70px]" value={editFields.responsibilitiesText} onChange={(e) => setEditFields({ ...editFields, responsibilitiesText: e.target.value })} />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Qualifications</label>
                <textarea className="w-full rounded border px-2 py-1.5 text-sm min-h-[70px]" value={editFields.qualificationsText} onChange={(e) => setEditFields({ ...editFields, qualificationsText: e.target.value })} />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Nice to have</label>
                <textarea className="w-full rounded border px-2 py-1.5 text-sm min-h-[60px]" value={editFields.niceToHaveText} onChange={(e) => setEditFields({ ...editFields, niceToHaveText: e.target.value })} />
              </div>

              <div className="grid grid-cols-1 gap-2">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Custom section title (optional)</label>
                  <input className="w-full rounded border px-2 py-1.5 text-sm" value={editFields.extraSectionTitle} onChange={(e) => setEditFields({ ...editFields, extraSectionTitle: e.target.value })} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Custom section content</label>
                  <textarea className="w-full rounded border px-2 py-1.5 text-sm min-h-[60px]" value={editFields.extraSectionBody} onChange={(e) => setEditFields({ ...editFields, extraSectionBody: e.target.value })} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Apply link (optional)</label>
                  <input className="w-full rounded border px-2 py-1.5 text-sm" value={editFields.applyUrl} onChange={(e) => setEditFields({ ...editFields, applyUrl: e.target.value })} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Apply email (optional)</label>
                  <input className="w-full rounded border px-2 py-1.5 text-sm" value={editFields.applyEmail} onChange={(e) => setEditFields({ ...editFields, applyEmail: e.target.value })} />
                </div>
              </div>
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button className="rounded border px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50" onClick={() => setEditingJob(null)}>Cancel</button>
              <button className="rounded bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-800 disabled:opacity-50" disabled={savingEdit} onClick={saveEdit}>{savingEdit ? "Saving…" : "Save changes"}</button>
            </div>
          </div>
        </div>
      )}

    </div>




    {/* ================= Branding Preview Modal ================= */}
    {showBrandingPreview && (
        <div className="fixed inset-0 z-40 flex items-start justify-center bg-black/50 p-6 overflow-auto">
          <div className="w-full max-w-5xl rounded-lg bg-white shadow-xl">
            <div className="flex items-center justify-between border-b p-4">
              <h3 className="text-lg font-semibold">Preview — {companyName}</h3>
              <div className="flex gap-2">
                <button className="text-sm px-3 py-1 rounded border" onClick={() => setShowBrandingPreview(false)}>Close</button>
                <button className="text-sm px-3 py-1 rounded bg-blue-600 text-white" onClick={() => { setShowBrandingPreview(false); saveBranding(); }}>Save & close</button>
              </div>
            </div>

            <div className="p-6">
              {/* Simple preview: header + job list */}
              <header className="mb-6">
                <div className="flex items-center gap-4">
                  {branding.logo ? <img src={branding.logo} alt="logo" className="h-12 w-12 object-contain" /> : <div className="h-12 w-12 rounded bg-slate-200" />}
                  <div>
                    <h1 className="text-2xl font-semibold">{companyName}</h1>
                    <p className="text-sm text-slate-600">{branding.heroText ?? companyData?.data?.description}</p>
                  </div>
                </div>
              </header>

              {/* include JobList so user sees unsaved branding applied to job tiles too */}
              <section>
                <h2 className="text-xl font-medium mb-2">Open roles</h2>
                <div>
                  {/* JobList renders cards and will pick up current jobsData */}
                  <JobList jobs={jobs} companySlug={slug} />
                </div>
              </section>

              {/* preview culture video embed if present (safe handling of YouTube) */}
              {previewEmbedUrl && (
                <section className="mt-6">
                  <h3 className="text-sm font-semibold mb-2">
                    Culture video (preview)
                  </h3>

                  <div className="aspect-video overflow-hidden rounded border bg-black">
                    <iframe
                      src={previewEmbedUrl}
                      title="Culture video preview"
                      className="w-full h-full"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                </section>
              )}
            </div>
          </div>
        </div>
      )}
  </div>
);
}
