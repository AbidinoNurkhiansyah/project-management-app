import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { AppShell } from "@/components/shared/AppShell";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => "/projects/p1/boards",
}));

describe("AppShell", () => {
  it("renders children content and navigation triggers", () => {
    render(
      <AppShell activeProjectId="p1" projects={[]}>
        <div data-testid="workspace-content">Workspace Active</div>
      </AppShell>
    );
    expect(screen.getByTestId("workspace-content")).toBeDefined();
    expect(screen.getByText("Quick actions")).toBeDefined();
  });
});
