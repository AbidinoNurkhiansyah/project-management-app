import { describe, it, expect } from "vitest";
import { validateCanvasPayloadSize } from "@/lib/canvas-validator";

describe("validateCanvasPayloadSize", () => {
  it("accepts canvas payloads under 800 KB ceiling", () => {
    const validData = { nodes: [{ id: "1", position: { x: 0, y: 0 }, data: {} }], edges: [] };
    expect(validateCanvasPayloadSize(validData)).toBe(true);
  });

  it("rejects canvas payloads exceeding 800 KB limit", () => {
    const heavyString = "A".repeat(850 * 1024);
    const heavyData = { nodes: [], edges: [], blob: heavyString };
    expect(validateCanvasPayloadSize(heavyData)).toBe(false);
  });
});
