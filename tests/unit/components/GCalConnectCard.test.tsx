import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { GCalConnectCard } from "@/components/integrations/GCalConnectCard";

describe("GCalConnectCard", () => {
  it("renders connect button when not connected", () => {
    render(<GCalConnectCard isConnected={false} onConnect={vi.fn()} onDisconnect={vi.fn()} />);
    expect(screen.getByText("Connect Calendar")).toBeDefined();
  });

  it("renders disconnect button when connected", () => {
    render(<GCalConnectCard isConnected={true} onConnect={vi.fn()} onDisconnect={vi.fn()} />);
    expect(screen.getByText("Disconnect")).toBeDefined();
  });
});
