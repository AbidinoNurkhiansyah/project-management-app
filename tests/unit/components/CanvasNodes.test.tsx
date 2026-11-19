import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { TaskNode, NoteNode } from "@/features/canvas";
import {
  CanvasQuickConnectProvider,
  MultiSelectActionBar,
  applyBulkColor,
  applyBulkShape,
} from "@/features/canvas/components/canvas-quick-connect";

vi.mock("@xyflow/react", () => ({
  Handle: ({
    id,
    onMouseEnter,
    onMouseLeave,
    onClick,
  }: {
    id?: string;
    onMouseEnter?: () => void;
    onMouseLeave?: () => void;
    onClick?: (e: React.MouseEvent) => void;
  }) => (
    <div
      data-testid={id ? `handle-${id}` : "handle"}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
    />
  ),
  Position: { Top: "top", Bottom: "bottom", Left: "left", Right: "right" },
  useReactFlow: () => ({ updateNodeData: vi.fn() }),
  useConnection: (selector?: (state: { inProgress: boolean }) => unknown) =>
    selector ? selector({ inProgress: false }) : { inProgress: false },
  MarkerType: { ArrowClosed: "arrowclosed" },
  SelectionMode: { Partial: "partial" },
  ConnectionMode: { Loose: "loose", Strict: "strict" },
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

  it("shows ghost shape suggestion on source dot hover and spawns on click", () => {
    const quickSpawnFromHandle = vi.fn();
    render(
      <CanvasQuickConnectProvider
        value={{
          quickSpawnFromHandle,
          wasRecentConnectDrag: () => false,
        }}
      >
        <TaskNode
          {...({
            data: { title: "Build API", priority: "MEDIUM" },
            id: "node-3",
            type: "taskNode",
            selected: false,
            zIndex: 1,
            isConnectable: true,
            dragging: false,
          } as any)}
        />
      </CanvasQuickConnectProvider>
    );

    const rightDot = screen.getByTestId("handle-right");
    fireEvent.mouseEnter(rightDot);
    expect(screen.getByText("Click dot or drag")).toBeDefined();

    fireEvent.mouseLeave(rightDot);
    expect(screen.queryByText("Click dot or drag")).toBeNull();

    for (const side of ["top", "right", "bottom", "left"] as const) {
      const dot = screen.getByTestId(`handle-${side}`);
      fireEvent.mouseEnter(dot);
      expect(screen.getByText("Click dot or drag")).toBeDefined();
      fireEvent.click(dot);
      expect(quickSpawnFromHandle).toHaveBeenCalledWith(
        "node-3",
        side,
        "taskNode"
      );
    }
  });
});

describe("Multi-select bulk shape & color", () => {
  const sampleNodes: any[] = [
    {
      id: "s1",
      type: "shapeNode",
      selected: true,
      position: { x: 0, y: 0 },
      style: { width: 160, height: 60 },
      data: { shape: "process", label: "Step 1", color: "blue" },
    },
    {
      id: "d1",
      type: "decisionNode",
      selected: true,
      position: { x: 200, y: 0 },
      data: { label: "Valid?", color: "violet" },
    },
    {
      id: "n1",
      type: "noteNode",
      selected: true,
      position: { x: 0, y: 120 },
      data: { text: "Keep note", color: "amber" },
    },
    {
      id: "t1",
      type: "taskNode",
      selected: true,
      position: { x: 200, y: 120 },
      data: { title: "Keep task", priority: "HIGH" },
    },
    {
      id: "s2",
      type: "shapeNode",
      selected: false,
      position: { x: 400, y: 0 },
      style: { width: 160, height: 60 },
      data: { shape: "process", label: "Unselected", color: "zinc" },
    },
  ];

  it("applyBulkShape changes only selected shape & decision nodes", () => {
    const result = applyBulkShape(sampleNodes, "database");
    const s1 = result.find((n) => n.id === "s1")!;
    const d1 = result.find((n) => n.id === "d1")!;
    const n1 = result.find((n) => n.id === "n1")!;
    const t1 = result.find((n) => n.id === "t1")!;
    const s2 = result.find((n) => n.id === "s2")!;

    expect(s1.type).toBe("shapeNode");
    expect(s1.data).toMatchObject({ shape: "database", label: "Step 1", color: "blue" });
    expect(s1.selected).toBe(true);

    expect(d1.type).toBe("shapeNode");
    expect(d1.data).toMatchObject({ shape: "database", label: "Valid?", color: "violet" });
    expect(d1.selected).toBe(true);

    expect(n1).toBe(sampleNodes[2]);
    expect(t1).toBe(sampleNodes[3]);
    expect(s2).toBe(sampleNodes[4]);
  });

  it("applyBulkShape can convert selected shapes to decisionNode preserving color", () => {
    const result = applyBulkShape(sampleNodes, "decision");
    const s1 = result.find((n) => n.id === "s1")!;
    const n1 = result.find((n) => n.id === "n1")!;

    expect(s1.type).toBe("decisionNode");
    expect(s1.data).toEqual({ label: "Step 1", color: "blue" });
    expect(n1.type).toBe("noteNode");
  });

  it("applyBulkColor updates all selected colorable nodes and ignores task/unselected", () => {
    const result = applyBulkColor(sampleNodes, "emerald");
    expect(result.find((n) => n.id === "s1")!.data.color).toBe("emerald");
    expect(result.find((n) => n.id === "d1")!.data.color).toBe("emerald");
    expect(result.find((n) => n.id === "n1")!.data.color).toBe("emerald");
    expect(result.find((n) => n.id === "t1")).toBe(sampleNodes[3]);
    expect(result.find((n) => n.id === "s2")!.data.color).toBe("zinc");
  });

  it("MultiSelectActionBar renders shape + color controls and fires callbacks", () => {
    const onChangeShape = vi.fn();
    const onChangeColor = vi.fn();
    render(
      <MultiSelectActionBar
        selectedCount={3}
        selectedShapeCount={2}
        selectedColorableCount={3}
        commonShape={null}
        commonColor="blue"
        onChangeShape={onChangeShape}
        onChangeColor={onChangeColor}
      />
    );

    expect(screen.getByText("3 selected")).toBeDefined();
    fireEvent.click(screen.getByLabelText("Change selected shapes to Database"));
    expect(onChangeShape).toHaveBeenCalledWith("database");

    fireEvent.click(screen.getByLabelText("Change selected color to rose"));
    expect(onChangeColor).toHaveBeenCalledWith("rose");
  });

  it("MultiSelectActionBar hides shape switcher when no shapes are selected", () => {
    render(
      <MultiSelectActionBar
        selectedCount={2}
        selectedShapeCount={0}
        selectedColorableCount={2}
        commonShape={null}
        commonColor="amber"
        onChangeShape={vi.fn()}
        onChangeColor={vi.fn()}
      />
    );

    expect(screen.queryByLabelText("Bulk shape switcher")).toBeNull();
    expect(screen.getByLabelText("Bulk color picker")).toBeDefined();
  });
});
