// src/lib/authz.ts
import { prisma } from "@/lib/prisma";

type Role = "OWNER" | "ADMIN" | "EDITOR" | "VIEWER";

export async function requireCompanyAccess({
  userId,
  companySlug,
  roles,
}: {
  userId: string;
  companySlug: string;
  roles: Role[];
}) {

  console.log("AuthZ check", { userId, companySlug, roles });

  
  if (!companySlug) {
    throw new Error("Missing company slug");
  }
  
  const company = await prisma.company.findUnique({
    where: { slug: companySlug },
  });

  if (!company) {
    throw new Error("Company not found");
  }

  const membership = await prisma.companyMember.findFirst({
    where: {
      userId,
      companyId: company.id,
      role: { in: roles },
    },
  });

  if (!membership) {
    throw new Error("Forbidden");
  }

  return { company, membership };
}
