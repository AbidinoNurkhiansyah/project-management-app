import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CommandMenu } from "@/components/shared/CommandMenu";

describe("CommandMenu", () => {
  it("renders command palette items when open", () => {
    render(<CommandMenu isOpen={true} onClose={vi.fn()} onNavigate={vi.fn()} />);
    expect(screen.getByPlaceholderText(/Type a command or search/i)).toBeDefined();
    expect(screen.getByText("Go to Tasks")).toBeDefined();
  });

  it("does not render when closed", () => {
    render(<CommandMenu isOpen={false} onClose={vi.fn()} onNavigate={vi.fn()} />);
    expect(screen.queryByPlaceholderText(/Type a command or search/i)).toBeNull();
  });

  it("handles navigation and closes when command clicked", () => {
    const handleNavigate = vi.fn();
    const handleClose = vi.fn();
    render(<CommandMenu isOpen={true} onClose={handleClose} onNavigate={handleNavigate} />);
    
    fireEvent.click(screen.getByText("Go to Tasks"));
    expect(handleNavigate).toHaveBeenCalledWith("tasks");
    expect(handleClose).toHaveBeenCalled();
  });
});
