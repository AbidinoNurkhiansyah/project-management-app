import { describe, it, expect } from "vitest";
import { getR2Client } from "@/lib/r2/client";

describe("getR2Client", () => {
  it("initializes S3Client with custom Cloudflare endpoint", () => {
    process.env.R2_ACCOUNT_ID = "test-account-id";
    process.env.R2_ACCESS_KEY_ID = "test-access-key";
    process.env.R2_SECRET_ACCESS_KEY = "test-secret-key";
    const client = getR2Client();
    expect(client).toBeDefined();
  });
});
