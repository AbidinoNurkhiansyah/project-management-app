import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { TopNav } from "@/components/shared/TopNav";

const mockProjects = [
  {
    id: "p1",
    name: "Alpha Project",
    color: "#3b82f6",
    slug: "alpha",
    userId: "u1",
    description: null,
    icon: null,
    isArchived: false,
    createdAt: "",
    updatedAt: "",
  },
];

describe("TopNav", () => {
  it("renders static Projects label when activeProjectId is null", () => {
    render(
      <TopNav
        projects={mockProjects}
        activeProjectId={null}
        onSelectProject={vi.fn()}
        onCreateProjectClick={vi.fn()}
        onOpenCommandMenu={vi.fn()}
      />
    );

    // Static text should exist
    expect(screen.getByText("Projects")).toBeDefined();
    // Dropdown for switching projects should not exist
    expect(screen.queryByText("Alpha Project")).toBeNull();
  });

  it("renders ProjectSwitcher when activeProjectId is provided", () => {
    render(
      <TopNav
        projects={mockProjects}
        activeProjectId="p1"
        onSelectProject={vi.fn()}
        onCreateProjectClick={vi.fn()}
        onOpenCommandMenu={vi.fn()}
      />
    );

    // Active project name in ProjectSwitcher dropdown button
    expect(screen.getByText("Alpha Project")).toBeDefined();
  });

  it("opens confirmation dialog before signing out", () => {
    const handleSignOut = vi.fn();
    render(
      <TopNav
        projects={[]}
        activeProjectId={null}
        onSelectProject={vi.fn()}
        onCreateProjectClick={vi.fn()}
        onOpenCommandMenu={vi.fn()}
        userEmail="dev@test.com"
        onSignOut={handleSignOut}
      />
    );

    const signOutBtn = screen.getByRole("button", { name: /sign out/i });
    expect(signOutBtn).toBeDefined();

    // Clicking sign out should NOT trigger callback directly
    fireEvent.click(signOutBtn);
    expect(handleSignOut).not.toHaveBeenCalled();

    // Confirm dialog should be open
    expect(screen.getByText("Are you sure you want to sign out of your workspace session?")).toBeDefined();

    // Confirm the action
    const confirmBtn = screen.getByRole("button", { name: /^sign out$/i });
    fireEvent.click(confirmBtn);
    expect(handleSignOut).toHaveBeenCalledTimes(1);
  });
});
