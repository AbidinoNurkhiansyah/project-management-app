import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { KanbanColumn } from "@/components/kanban/KanbanColumn";

vi.mock("@dnd-kit/core", () => ({
  useDroppable: () => ({ setNodeRef: vi.fn(), isOver: false }),
}));

vi.mock("@dnd-kit/sortable", () => ({
  SortableContext: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  verticalListSortingStrategy: {},
}));

describe("KanbanColumn", () => {
  it("renders column header and task counter", () => {
    render(
      <KanbanColumn
        columnId="TODO"
        title="To Do"
        tasks={[]}
        onTaskEdit={vi.fn()}
      />
    );
    expect(screen.getByText("To Do")).toBeDefined();
    expect(screen.getByText("0")).toBeDefined();
  });
});
