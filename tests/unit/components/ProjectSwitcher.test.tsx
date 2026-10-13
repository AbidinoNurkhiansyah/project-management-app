import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProjectSwitcher } from "@/components/shared/ProjectSwitcher";

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
  {
    id: "p2",
    name: "Beta Project",
    color: "#10b981",
    slug: "beta",
    userId: "u1",
    description: null,
    icon: null,
    isArchived: false,
    createdAt: "",
    updatedAt: "",
  },
];

describe("ProjectSwitcher", () => {
  it("renders active project name", () => {
    render(
      <ProjectSwitcher
        projects={mockProjects}
        activeProjectId="p1"
        onSelectProject={vi.fn()}
        onCreateClick={vi.fn()}
      />
    );
    expect(screen.getByText("Alpha Project")).toBeDefined();
  });
});
