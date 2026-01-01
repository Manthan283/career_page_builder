// lib/validations/company.ts
import { z } from "zod";

export const companyBrandingSchema = z.object({
  logo: z.string().url().optional().or(z.literal("")),
  primaryColor: z.string().optional(),
  aboutCompany: z.string().max(300).optional(),
  about: z.string().optional(),
});

export const companySettingsSchema = z
  .object({
    // define what you actually allow in settings
    // for now, allow any JSON-ish object
  })
  .passthrough(); // passes through unknown keys

export const companyUpdateSchema = z.object({
  branding: companyBrandingSchema.optional(),
  settings: companySettingsSchema.optional(),
});
