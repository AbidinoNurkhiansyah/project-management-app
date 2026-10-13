import { describe, it, expect } from "vitest";
import { requireAuthUser } from "@/actions/auth-guard";

describe("requireAuthUser", () => {
  it("throws Unauthorized error when token is null", async () => {
    await expect(requireAuthUser(null)).rejects.toThrow("Unauthorized");
  });
});
