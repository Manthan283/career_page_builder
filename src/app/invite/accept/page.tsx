"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

type Status =
  | "loading"
  | "unauthenticated"
  | "accepting"
  | "success"
  | "error";

export default function InviteAcceptPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();

  const token = searchParams.get("token");

  const [status, setStatus] = useState<Status>("loading");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setError("Invalid invite link.");
      return;
    }

    if (sessionStatus === "loading") {
      return;
    }

    if (!session?.user) {
      setStatus("unauthenticated");
      return;
    }

    async function acceptInvite() {
      try {
        setStatus("accepting");

        const res = await fetch("/api/invites/accept", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token }),
        });

        if (!res.ok) {
          const text = await res.text();
          throw new Error(
            text.includes("<!DOCTYPE")
              ? "You must be signed in to accept this invite."
              : "Failed to accept invite."
          );
        }

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Failed to accept invite");
        }

        setStatus("success");

        // Redirect after short delay
        setTimeout(() => {
          router.push("/");
        }, 1500);
      } catch (err: any) {
        setStatus("error");
        setError(err.message);
      }
    }

    acceptInvite();
  }, [token, session, sessionStatus, router]);

  /* ---------------- UI ---------------- */

  if (status === "loading" || status === "accepting") {
    return (
      <Centered>
        <Spinner />
        <p className="mt-4 text-sm text-slate-600">
          Accepting your invite…
        </p>
      </Centered>
    );
  }

  if (status === "unauthenticated") {
    return (
      <Centered>
        <h1 className="text-lg font-semibold text-slate-900">
          Sign in required
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Please sign in to accept your invitation.
        </p>
        <button
          onClick={() =>
            router.push(`/login?callbackUrl=${encodeURIComponent(window.location.href)}`)
          }
          className="mt-4 rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          Go to login
        </button>
      </Centered>
    );
  }

  if (status === "success") {
    return (
      <Centered>
        <div className="text-green-600 text-3xl">✓</div>
        <h1 className="mt-4 text-lg font-semibold text-slate-900">
          Invite accepted
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          You now have access. Redirecting…
        </p>
      </Centered>
    );
  }

  // error
  return (
    <Centered>
      <h1 className="text-lg font-semibold text-slate-900">
        Unable to accept invite
      </h1>
      <p className="mt-2 text-sm text-red-600">
        {error ?? "Something went wrong."}
      </p>
    </Centered>
  );
}

/* ---------------- Small UI helpers ---------------- */

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        {children}
      </div>
    </main>
  );
}

function Spinner() {
  return (
    <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900" />
  );
}
