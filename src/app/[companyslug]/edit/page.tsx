// app/[companySlug]/edit/page.tsx
import EditorPageClient from "./EditorPageClient";

export default async function EditorPage({
  params,
}: {
  params: Promise<{ companySlug: string }>;
}) {
  const { companySlug } = await params;   // 👈 unwrap Promise

  // later: add getServerSession() here to protect the route
  return <EditorPageClient params={{ companySlug }} />;
}
