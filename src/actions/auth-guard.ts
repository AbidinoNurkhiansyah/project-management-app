import { getAdminAuth } from "@/lib/firebase/admin";

export interface AuthenticatedUser {
  uid: string;
  email: string | null;
}

export async function requireAuthUser(token: string | null): Promise<AuthenticatedUser> {
  if (!token) {
    throw new Error("Unauthorized: Authentication token is required");
  }

  try {
    const decodedToken = await getAdminAuth().verifyIdToken(token);
    return {
      uid: decodedToken.uid,
      email: decodedToken.email ?? null,
    };
  } catch {
    throw new Error("Unauthorized: Invalid or expired token");
  }
}
