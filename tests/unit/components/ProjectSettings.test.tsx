import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import ProjectSettingsPage from "@/app/projects/[projectId]/settings/page";

const mockDeleteProject = vi.fn().mockResolvedValue(undefined);
const mockPush = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("@/hooks/useProjects", () => ({
  useProjects: () => ({
    deleteProject: mockDeleteProject,
  }),
}));

describe("ProjectSettingsPage", () => {
  it("opens ConfirmDialog before cascading delete", async () => {
    render(<ProjectSettingsPage params={{ projectId: "proj-123" }} />);

    const deleteBtn = screen.getByRole("button", { name: /^delete project$/i });
    expect(deleteBtn).toBeDefined();

    // Clicking delete button opens modal instead of triggering delete
    fireEvent.click(deleteBtn);
    expect(mockDeleteProject).not.toHaveBeenCalled();

    // Dialog appears with description
    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeDefined();
    expect(
      within(dialog).getByText(/permanently purge all tasks, boards, and Cloudflare R2 attachments/i)
    ).toBeDefined();

    // Click confirm in the modal
    const confirmBtn = within(dialog).getByRole("button", { name: /^delete project$/i });
    fireEvent.click(confirmBtn);

    expect(mockDeleteProject).toHaveBeenCalledWith("proj-123");
  });
});
