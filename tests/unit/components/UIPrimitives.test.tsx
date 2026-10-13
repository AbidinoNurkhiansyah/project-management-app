import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Dialog, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/Dialog";

describe("UI Primitives", () => {
  it("renders Button with variants and triggers onClick", () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click Me</Button>);
    const btn = screen.getByText("Click Me");
    expect(btn).toBeDefined();
    fireEvent.click(btn);
    expect(handleClick).toHaveBeenCalled();
  });

  it("renders Input and receives change event", () => {
    render(<Input placeholder="Enter title" />);
    const input = screen.getByPlaceholderText("Enter title");
    expect(input).toBeDefined();
  });

  it("renders Badge with semantic color", () => {
    render(<Badge variant="emerald">Completed</Badge>);
    expect(screen.getByText("Completed")).toBeDefined();
  });

  it("renders Dialog when open is true", () => {
    render(
      <Dialog open={true} onOpenChange={vi.fn()}>
        <DialogHeader>
          <DialogTitle>Modal Title</DialogTitle>
        </DialogHeader>
        <p>Dialog Body</p>
        <DialogFooter>
          <button>OK</button>
        </DialogFooter>
      </Dialog>
    );
    expect(screen.getByText("Modal Title")).toBeDefined();
    expect(screen.getByText("Dialog Body")).toBeDefined();
  });
});
