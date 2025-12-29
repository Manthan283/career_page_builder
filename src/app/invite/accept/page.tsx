import { Suspense } from "react";
import InviteAcceptClient from "./InviteAcceptClient";

export default function InviteAcceptPage() {
  return (
    <Suspense fallback={<InviteAcceptLoading />}>
      <InviteAcceptClient />
    </Suspense>
  );
}

function InviteAcceptLoading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900" />
        <p className="mt-4 text-sm text-slate-600">
          Loading invite…
        </p>
      </div>
    </main>
  );
}
