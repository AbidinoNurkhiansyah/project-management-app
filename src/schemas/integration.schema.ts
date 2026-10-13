import { z } from "zod";

export const GoogleIntegrationSchema = z.object({
  accessToken: z.string().min(1),
  refreshToken: z.string().min(1),
  expiryDate: z.number().positive(),
  scope: z.string().min(1),
  updatedAt: z.string().datetime(),
});

export type GoogleIntegration = z.infer<typeof GoogleIntegrationSchema>;
