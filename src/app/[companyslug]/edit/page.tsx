import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { requireCompanyAccess } from "@/lib/authz";
import EditorPageClient from "./EditorPageClient";

export default async function EditorPage(props: {
  params: { companySlug: string } | Promise<{ companySlug: string }>;
}) {
  const { companySlug } =
    typeof (props.params as any).then === "function"
      ? await props.params
      : props.params;

  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
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
