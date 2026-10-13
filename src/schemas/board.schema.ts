import { z } from "zod";

export const BoardCreateInputSchema = z.object({
  projectId: z.string().min(1, "Project ID is required"),
  title: z.string().min(1, "Title is required").max(100),
  description: z.string().max(500).optional(),
  type: z.enum(["KANBAN", "FLOWCHART"]).default("KANBAN"),
});

export type BoardCreateInput = z.infer<typeof BoardCreateInputSchema>;
