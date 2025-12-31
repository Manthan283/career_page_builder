import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { requireCompanyAccess } from "@/lib/authz";
import EditorPageClient from "./EditorPageClient";

export default async function EditorPage({
  params,
}: {
  params: Promise<{ companySlug: string }>;
}) {
  const { companySlug } = await params;

  const session = await auth();

  if (!session?.user?.id) {
    redirect(`/login?callbackUrl=/${companySlug}/edit`);
  }

  try {
    await requireCompanyAccess({
      userId: session.user.id,
      companySlug,
      roles: ["OWNER", "ADMIN", "EDITOR"],
    });
  } catch {
    redirect("/403");
  }

  return <EditorPageClient params={{ companySlug }} />;
}
