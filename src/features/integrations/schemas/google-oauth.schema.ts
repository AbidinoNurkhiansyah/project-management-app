import { z } from "zod";

const SAFE_ID_REGEX = /^[a-zA-Z0-9_-]{1,128}$/;
const SAFE_RETURN_TO_REGEX = /^\/(?!\/)[a-zA-Z0-9/_-]{0,256}$/;

export const GoogleOAuthStartSchema = z.object({
  projectId: z.string().regex(SAFE_ID_REGEX, "Invalid projectId").optional(),
  returnTo: z
    .string()
    .regex(SAFE_RETURN_TO_REGEX, "Invalid returnTo path")
    .optional(),
  userId: z.string().regex(SAFE_ID_REGEX, "Invalid userId"),
});

export const GoogleOAuthStatePayloadSchema = GoogleOAuthStartSchema.extend({
  exp: z.number().int().positive(),
});

export type GoogleOAuthStartInput = z.infer<typeof GoogleOAuthStartSchema>;
export type GoogleOAuthStatePayload = z.infer<typeof GoogleOAuthStatePayloadSchema>;
