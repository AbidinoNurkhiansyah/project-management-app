import { z } from "zod";

export const ProjectCreateInputSchema = z.object({
  name: z.string().min(1, "Project name is required").max(60),
  description: z.string().max(500).nullable().optional(),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Must be valid 6-character hex color")
    .default("#3b82f6"),
  icon: z.string().nullable().optional(),
});

export const ProjectUpdateInputSchema = ProjectCreateInputSchema.partial().extend({
  isArchived: z.boolean().optional(),
});

export type ProjectCreateInput = z.infer<typeof ProjectCreateInputSchema>;
export type ProjectUpdateInput = z.infer<typeof ProjectUpdateInputSchema>;
