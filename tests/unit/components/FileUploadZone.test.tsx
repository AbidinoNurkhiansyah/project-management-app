import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { FileUploadZone } from "@/components/shared/FileUploadZone";

describe("FileUploadZone", () => {
  it("renders upload callout text", () => {
    render(<FileUploadZone projectId="p1" onUploadComplete={vi.fn()} />);
    expect(screen.getByText(/Drag & drop file or click to browse/i)).toBeDefined();
  });
});
