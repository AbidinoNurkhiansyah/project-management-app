import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CanvasToolbar } from "@/components/canvas/CanvasToolbar";

describe("CanvasToolbar", () => {
  it("triggers onAddNode when task button clicked", () => {
    const handleAdd = vi.fn();
    render(<CanvasToolbar onAddNode={handleAdd} />);
    fireEvent.click(screen.getByText("+ Task"));
    expect(handleAdd).toHaveBeenCalledWith("taskNode");
  });
});
