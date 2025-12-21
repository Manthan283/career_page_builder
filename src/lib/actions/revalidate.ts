// lib/actions/revalidate.ts
"use server";

import { revalidatePath } from "next/cache";

export async function revalidateCompany(slug: string) {
  // matches your public careers URL: /[slug]/careers
  await revalidatePath(`/${slug}/careers`);
}
