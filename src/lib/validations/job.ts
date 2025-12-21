// lib/validations/job.ts
import { z } from "zod";

export const jobCreateSchema = z.object({
  title: z.string().min(1).max(200),
  location: z.string().max(200).optional().nullable(),
  jobType: z.string().max(100).optional().nullable(),
  description: z.string().min(1),
  responsibilities: z.array(z.string()).optional(),
  qualifications: z.array(z.string()).optional(),
});

export const jobUpdateSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  location: z.string().max(200).optional().nullable(),
  jobType: z.string().max(100).optional().nullable(),
  description: z.string().min(1).optional(),
  responsibilities: z.array(z.string()).optional(),
  qualifications: z.array(z.string()).optional(),
  isPublished: z.boolean().optional(),
});
