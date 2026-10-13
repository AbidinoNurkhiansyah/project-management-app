import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { TaskCard } from "@/components/kanban/TaskCard";

vi.mock("@dnd-kit/sortable", () => ({
  useSortable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: vi.fn(),
    transform: null,
    transition: null,
    isDragging: false,
  }),
}));

const mockTask = {
  id: "t1",
  userId: "u1",
  projectId: "p1",
  boardId: null,
  columnId: "TODO",
  order: 1000,
  title: "Setup R2 Bucket",
  description: "Configure CORS and credentials",
  dueDate: null,
  priority: "HIGH" as const,
  gcalEventId: null,
  attachments: [],
  createdAt: "",
  updatedAt: "",
};

describe("TaskCard", () => {
  it("renders card title", () => {
    render(<TaskCard task={mockTask} onEdit={vi.fn()} />);
    expect(screen.getByText("Setup R2 Bucket")).toBeDefined();
  });
});
