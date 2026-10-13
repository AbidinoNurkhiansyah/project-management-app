import { describe, it, expect } from "vitest";
import { UserProfileSchema } from "@/schemas/auth.schema";

describe("UserProfileSchema", () => {
  it("validates correct user profile", () => {
    const valid = {
      uid: "user-123",
      email: "engineer@company.com",
      displayName: "Jane Doe",
      photoURL: "https://avatar.example.com/jane.png",
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    };
    const result = UserProfileSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it("accepts null displayName and photoURL", () => {
    const valid = {
      uid: "user-456",
      email: null,
      displayName: null,
      photoURL: null,
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    };
    const result = UserProfileSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });
});
