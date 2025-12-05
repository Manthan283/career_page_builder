"use client";
import React, { useEffect, useState } from "react";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function EditorPage({ params }: { params: { companySlug: string }}) {
  const slug = params.companySlug;
  const { data: companyData, mutate: mutateCompany } = useSWR(`/api/company/${slug}`, fetcher);
  const { data: jobsData, mutate: mutateJobs } = useSWR(`/api/company/${slug}/jobs`, fetcher);
  const [branding, setBranding] = useState<any>({});
  const [newJob, setNewJob] = useState({ title: "", location: "", jobType: "Full-time", description: "" });

  useEffect(() => {
    if (companyData?.data) setBranding(companyData.data.branding ?? {});
  }, [companyData]);

  async function saveBranding() {
    await fetch(`/api/company/${slug}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "x-admin-company": slug
      },
      body: JSON.stringify({ branding })
    });
    mutateCompany();
    // revalidate jobs page will be attempted by API
  }

  async function createJob() {
    await fetch(`/api/company/${slug}/jobs`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-admin-company": slug },
      body: JSON.stringify(newJob)
    });
    setNewJob({ title: "", location: "", jobType: "Full-time", description: "" });
    mutateJobs();
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-xl font-semibold mb-4">Editor: {slug}</h1>
      <div className="grid grid-cols-3 gap-6">
        <section className="col-span-1 bg-white p-4 rounded border">
          <h2 className="font-medium">Branding</h2>
          <label className="block text-sm mt-2">Logo URL</label>
          <input className="border p-2 w-full" value={branding.logo ?? ""} onChange={e => setBranding({...branding, logo: e.target.value})} />
          <label className="block text-sm mt-2">Hero text</label>
          <input className="border p-2 w-full" value={branding.heroText ?? ""} onChange={e => setBranding({...branding, heroText: e.target.value})} />
          <button className="mt-4 bg-blue-600 text-white px-3 py-1 rounded" onClick={saveBranding}>Save Branding</button>
        </section>

        <section className="col-span-2 bg-white p-4 rounded border">
          <h2 className="font-medium">Jobs</h2>

          <div className="mt-3 grid grid-cols-2 gap-3">
            <input className="border p-2" placeholder="Title" value={newJob.title} onChange={e => setNewJob({...newJob, title: e.target.value})} />
            <input className="border p-2" placeholder="Location" value={newJob.location} onChange={e => setNewJob({...newJob, location: e.target.value})} />
            <select className="border p-2" value={newJob.jobType} onChange={e => setNewJob({...newJob, jobType: e.target.value})}>
              <option>Full-time</option>
              <option>Part-time</option>
              <option>Contract</option>
              <option>Intern</option>
            </select>
            <button className="bg-green-600 text-white px-3 py-1 rounded" onClick={createJob}>Create Job</button>
          </div>

          <div className="mt-4">
            <h3 className="font-medium">Existing</h3>
            {!jobsData ? <p>Loading...</p> : <ul>
              {jobsData.data.map((j: any) => (
                <li key={j.id} className="border p-2 mt-2 rounded">
                  <div className="flex justify-between">
                    <div>
                      <div className="font-semibold">{j.title}</div>
                      <div className="text-sm text-slate-600">{j.location} · {j.jobType}</div>
                    </div>
                    <div className="text-sm">
                      <a className="text-blue-600" href={`/${slug}/careers/${j.slug}`} target="_blank" rel="noreferrer">View</a>
                    </div>
                  </div>
                </li>
              ))}
            </ul>}
          </div>
        </section>
      </div>
    </div>
  );
}
