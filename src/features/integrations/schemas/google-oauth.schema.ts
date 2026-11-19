import { z } from "zod";

const SAFE_ID_REGEX = /^[a-zA-Z0-9_-]{1,128}$/;

export const GoogleOAuthStartSchema = z.object({
  projectId: z.string().regex(SAFE_ID_REGEX, "Invalid projectId"),
  userId: z.string().regex(SAFE_ID_REGEX, "Invalid userId"),
});

export const GoogleOAuthStatePayloadSchema = GoogleOAuthStartSchema.extend({
  exp: z.number().int().positive(),
});

export type GoogleOAuthStartInput = z.infer<typeof GoogleOAuthStartSchema>;
export type GoogleOAuthStatePayload = z.infer<typeof GoogleOAuthStatePayloadSchema>;
