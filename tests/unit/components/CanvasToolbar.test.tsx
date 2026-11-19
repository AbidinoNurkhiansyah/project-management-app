import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CanvasToolbar } from "@/features/canvas";

describe("CanvasToolbar", () => {
  it("triggers onAddNode when task button clicked", () => {
    const handleAdd = vi.fn();
    render(<CanvasToolbar onAddNode={handleAdd} />);
    fireEvent.click(screen.getByText("Task"));
    expect(handleAdd).toHaveBeenCalledWith("taskNode");
  });

  it("triggers onAddShape when flowchart shape selected", () => {
    const handleAddNode = vi.fn();
    const handleAddShape = vi.fn();
    render(
      <CanvasToolbar onAddNode={handleAddNode} onAddShape={handleAddShape} />
    );
    fireEvent.click(screen.getByText("Shapes"));
    fireEvent.click(screen.getByText("Process"));
    expect(handleAddShape).toHaveBeenCalledWith("process");
  });

  it("renders Undo/Redo buttons with disabled states and triggers callbacks", () => {
    const onUndo = vi.fn();
    const onRedo = vi.fn();
    render(
      <CanvasToolbar
        onAddNode={vi.fn()}
        onUndo={onUndo}
        onRedo={onRedo}
        canUndo={true}
        canRedo={false}
      />
    );
    const undoBtn = screen.getByRole("button", { name: "Undo" });
    const redoBtn = screen.getByRole("button", { name: "Redo" });
    expect((undoBtn as HTMLButtonElement).disabled).toBe(false);
    expect((redoBtn as HTMLButtonElement).disabled).toBe(true);

    fireEvent.click(undoBtn);
    expect(onUndo).toHaveBeenCalledTimes(1);
  });

  it("triggers onExport for PDF and DOCX with selection count", () => {
    const onExport = vi.fn();
    render(
      <CanvasToolbar
        onAddNode={vi.fn()}
        onExport={onExport}
        selectedCount={2}
        totalNodesCount={5}
      />
    );
    fireEvent.click(screen.getByText("Export (2)"));
    expect(screen.getByText("Selected (2)")).toBeDefined();
    fireEvent.click(screen.getByText("Export PDF"));
    expect(onExport).toHaveBeenCalledWith("pdf");

    fireEvent.click(screen.getByText("Export (2)"));
    fireEvent.click(screen.getByText("Export DOCX"));
    expect(onExport).toHaveBeenCalledWith("docx");
  });
});
