import { describe, it, expect } from "vitest";
import { GoogleIntegrationSchema } from "@/schemas/integration.schema";

describe("GoogleIntegrationSchema", () => {
  it("validates Google integration document structure", () => {
    const valid = {
      accessToken: "ya29.sample",
      refreshToken: "iv:tag:ciphertext",
      expiryDate: 1770000000000,
      scope: "https://www.googleapis.com/auth/calendar.events",
      updatedAt: new Date().toISOString(),
    };
    const result = GoogleIntegrationSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });
});
