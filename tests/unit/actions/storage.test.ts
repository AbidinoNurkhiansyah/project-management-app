import { describe, it, expect, vi } from "vitest";
import { getPresignedUploadUrlAction } from "@/actions/storage.actions";

vi.mock("@/actions/auth-guard", () => ({
  requireAuthUser: vi.fn().mockResolvedValue({ uid: "user-123" }),
}));

vi.mock("@aws-sdk/s3-request-presigner", () => ({
  getSignedUrl: vi.fn().mockResolvedValue("https://r2.signed-url.example/upload"),
}));

describe("getPresignedUploadUrlAction", () => {
  it("rejects files larger than 10MB ceiling", async () => {
    await expect(
      getPresignedUploadUrlAction({
        projectId: "p1",
        fileName: "heavy.zip",
        fileType: "application/zip",
        fileSize: 15 * 1024 * 1024,
        token: "valid-token",
      })
    ).rejects.toThrow("File size exceeds 10MB limit");
  });
});
