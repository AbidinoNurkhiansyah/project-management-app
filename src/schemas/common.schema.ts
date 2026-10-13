import { z } from "zod";

export const BaseDocumentSchema = z.object({
  id: z.string().min(1),
  userId: z.string().min(1),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const FileAttachmentSchema = z.object({
  fileName: z.string().min(1),
  fileUrl: z.string().url(),
  filePath: z.string().min(1),
  fileSize: z.number().nonnegative(),
  fileType: z.string().min(1),
});
