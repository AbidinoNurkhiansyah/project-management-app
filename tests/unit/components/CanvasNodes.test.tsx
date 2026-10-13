import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { TaskNode } from "@/components/canvas/TaskNode";
import { NoteNode } from "@/components/canvas/NoteNode";

vi.mock("@xyflow/react", () => ({
  Handle: () => <div data-testid="handle" />,
  Position: { Top: "top", Bottom: "bottom", Left: "left", Right: "right" },
}));

describe("Canvas Nodes", () => {
  it("renders TaskNode with title", () => {
    render(
      <TaskNode
        {...({
          data: { title: "Deploy to Vercel", priority: "HIGH" },
          id: "node-1",
          type: "taskNode",
          selected: false,
          zIndex: 1,
          isConnectable: true,
          dragging: false,
        } as any)}
      />
    );
    expect(screen.getByText("Deploy to Vercel")).toBeDefined();
  });

  it("renders NoteNode with text", () => {
    render(
      <NoteNode
        {...({
          data: { text: "Brainstorming idea" },
          id: "node-2",
          type: "noteNode",
          selected: false,
          zIndex: 1,
          isConnectable: true,
          dragging: false,
        } as any)}
      />
    );
    expect(screen.getByText("Brainstorming idea")).toBeDefined();
  });
});
