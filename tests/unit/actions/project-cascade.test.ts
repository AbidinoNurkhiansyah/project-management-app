import { describe, it, expect, vi } from "vitest";
import { deleteProjectCascadeAction } from "@/actions/project-cascade.actions";

vi.mock("@/actions/auth-guard", () => ({
  requireAuthUser: vi.fn().mockResolvedValue({ uid: "user-123" }),
}));

const mockDocGet = vi.fn();
const mockBatchDelete = vi.fn();
const mockBatchCommit = vi.fn();
const mockR2Send = vi.fn();

vi.mock("@/lib/firebase/admin", () => ({
  getAdminFirestore: vi.fn(() => ({
    collection: vi.fn(() => ({
      doc: vi.fn(() => ({
        get: mockDocGet,
      })),
      where: vi.fn(() => ({
        get: vi.fn().mockResolvedValue({ docs: [{ ref: "task-ref-1" }] }),
      })),
    })),
    batch: vi.fn(() => ({
      delete: mockBatchDelete,
      commit: mockBatchCommit,
    })),
  })),
}));

vi.mock("@/lib/r2/client", () => ({
  getR2Client: vi.fn(() => ({
    send: mockR2Send,
  })),
  R2_BUCKET_NAME: "test-bucket",
}));

describe("deleteProjectCascadeAction", () => {
  it("rejects when project does not exist", async () => {
    mockDocGet.mockResolvedValueOnce({ exists: false });
    await expect(deleteProjectCascadeAction("invalid-proj", "token")).rejects.toThrow(
      "Project not found or unauthorized"
    );
  });

  it("cascades deletion across R2 and Firestore when authorized", async () => {
    mockDocGet.mockResolvedValueOnce({
      exists: true,
      data: () => ({ userId: "user-123" }),
    });
    mockR2Send
      .mockResolvedValueOnce({ Contents: [{ Key: "users/user-123/projects/p1/file.png" }] })
      .mockResolvedValueOnce({});
    mockBatchCommit.mockResolvedValueOnce([]);

    const res = await deleteProjectCascadeAction("p1", "token");
    expect(res).toEqual({ success: true });
    expect(mockR2Send).toHaveBeenCalled();
    expect(mockBatchDelete).toHaveBeenCalled();
    expect(mockBatchCommit).toHaveBeenCalled();
  });
});

