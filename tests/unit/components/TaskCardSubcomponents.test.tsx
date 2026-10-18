import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { TaskCardHeader } from "@/components/kanban/TaskCardHeader";
import { TaskCardMeta } from "@/components/kanban/TaskCardMeta";

describe("TaskCardHeader", () => {
  it("renders title and priority badge", () => {
    render(<TaskCardHeader title="Implement R2 Presign" priority="HIGH" />);
    expect(screen.getByText("Implement R2 Presign")).toBeDefined();
    expect(screen.getByText("HIGH")).toBeDefined();
  });
});

describe("TaskCardMeta", () => {
  it("renders attachment badge count when > 0", () => {
    render(<TaskCardMeta dueDate={null} attachmentCount={3} hasGCal={false} />);
    expect(screen.getByText("3")).toBeDefined();
  });
});
