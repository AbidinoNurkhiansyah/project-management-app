import { z } from "zod";
import { FileAttachmentSchema } from "./common.schema";

export const TaskCreateInputSchema = z.object({
  projectId: z.string().min(1, "Project ID is required"),
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(2000).nullable().optional(),
  boardId: z.string().nullable().optional(),
  columnId: z.string().default("TODO"),
  order: z.number().default(0),
  dueDate: z.string().datetime().nullable().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).default("MEDIUM"),
  attachments: z.array(FileAttachmentSchema).default([]),
});

export const TaskUpdateInputSchema = TaskCreateInputSchema.partial();

export type TaskCreateInput = z.input<typeof TaskCreateInputSchema>;
export type TaskUpdateInput = z.input<typeof TaskUpdateInputSchema>;
