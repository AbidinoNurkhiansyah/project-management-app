import { describe, it, expect } from "vitest";
import { FileAttachmentSchema } from "@/schemas/common.schema";

describe("FileAttachmentSchema", () => {
  it("validates correct attachment payload", () => {
    const validData = {
      fileName: "spec.pdf",
      fileUrl: "https://r2.cdn.example.com/spec.pdf",
      filePath: "users/u1/projects/p1/attachments/spec.pdf",
      fileSize: 1048576,
      fileType: "application/pdf",
    };
    const result = FileAttachmentSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("fails on invalid url", () => {
    const invalidData = {
      fileName: "spec.pdf",
      fileUrl: "invalid-url",
      filePath: "users/u1/projects/p1/attachments/spec.pdf",
      fileSize: 1048576,
      fileType: "application/pdf",
    };
    const result = FileAttachmentSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });
});
