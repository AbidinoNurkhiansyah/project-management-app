import { z } from "zod";

export const UserProfileSchema = z.object({
  uid: z.string().min(1),
  email: z.string().email().nullable(),
  displayName: z.string().nullable(),
  photoURL: z.string().url().nullable(),
  createdAt: z.string().datetime(),
  lastLoginAt: z.string().datetime(),
});

export type UserProfile = z.infer<typeof UserProfileSchema>;
