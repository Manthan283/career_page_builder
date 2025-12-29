// app/layout.tsx
"use client";

import "./globals.css";
import React from "react";
import { SessionProvider } from "next-auth/react";
import UserMenu from "@/components/auth/UserMenu";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50">
        <SessionProvider>
          {/* Global top bar */}
          <header className="flex items-center justify-between border-b bg-white px-4 py-3">
            <h1 className="text-sm font-semibold text-slate-900">
              Careers Platform
            </h1>

            <UserMenu />
          </header>

          {/* App content */}
          <main>{children}</main>
        </SessionProvider>
      </body>
    </html>
  );
}
