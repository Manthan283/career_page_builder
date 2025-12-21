// components/Navbar.tsx
import Link from "next/link";

type NavbarProps = {
  companyName?: string;
  companySlug?: string;
};

export default function Navbar({ companyName, companySlug }: NavbarProps) {
  const title = companyName ? `${companyName} · Careers` : "Careers Builder";

  return (
    <header className="border-b bg-white/80 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="rounded-md border border-slate-200 bg-slate-900 px-2 py-1 text-xs font-semibold text-white"
          >
            CB
          </Link>
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-semibold text-slate-900">
              {title}
            </span>
            <span className="text-[11px] text-slate-500">
              Internal careers / ATS prototype
            </span>
          </div>
        </div>

        <nav className="flex items-center gap-4 text-xs text-slate-600">
          {companySlug && (
            <Link
              href={`/${companySlug}/careers`}
              className="hidden sm:inline text-slate-600 hover:text-slate-900"
            >
              Public page
            </Link>
          )}
          <Link
            href="https://nextjs.org/docs"
            className="hidden sm:inline hover:text-slate-900"
          >
            Docs
          </Link>
          <button className="rounded-full border border-slate-300 bg-slate-50 px-3 py-1 text-xs font-medium hover:bg-slate-100">
            Sign in
          </button>
        </nav>
      </div>
    </header>
  );
}
