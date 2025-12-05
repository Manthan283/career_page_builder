// app/layout.tsx
import "./globals.css";
import React from "react";

export const metadata = {
  title: "Careers Builder Prototype",
  description: "Prototype careers pages"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen bg-slate-50">{children}</div>
      </body>
    </html>
  );
}
