import { z } from "zod";

export const AuthCredentialsSchema = z.object({
  email: z.string().trim().email("Enter a valid email address."),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters."),
});

export type AuthCredentialsInput = z.infer<typeof AuthCredentialsSchema>;

export const UserProfileSchema = z.object({
  uid: z.string().min(1),
  email: z.string().email().nullable(),
  displayName: z.string().nullable(),
  photoURL: z.string().url().nullable(),
  createdAt: z.string().datetime(),
  lastLoginAt: z.string().datetime(),
});

export type UserProfile = z.infer<typeof UserProfileSchema>;

const FIREBASE_ERROR_MAP: Record<string, string> = {
  "auth/invalid-credential": "Invalid email or password.",
  "auth/user-not-found": "No account found with this email.",
  "auth/wrong-password": "Invalid email or password.",
  "auth/email-already-in-use": "An account with this email already exists.",
  "auth/weak-password": "Password must be at least 6 characters.",
  "auth/too-many-requests": "Too many attempts. Please try again later.",
  "auth/popup-closed-by-user": "Sign-in popup was closed before completing.",
  "auth/network-request-failed": "Network error. Check your connection.",
};

export function formatAuthError(err: unknown): string {
  if (err && typeof err === "object" && "code" in err) {
    const code = String((err as { code?: unknown }).code);
    if (FIREBASE_ERROR_MAP[code]) {
      return FIREBASE_ERROR_MAP[code];
    }
  }
  if (err instanceof Error && err.message) {
    return err.message;
  }
  return "Authentication failed. Please try again.";
}
