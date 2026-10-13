import { describe, it, expect } from "vitest";
import { calculateFractionalOrder } from "@/lib/kanban-order";

describe("calculateFractionalOrder", () => {
  it("calculates initial midpoint for empty list", () => {
    expect(calculateFractionalOrder(null, null)).toBe(1000);
  });

  it("calculates order prepending before first item", () => {
    expect(calculateFractionalOrder(null, 1000)).toBe(500);
  });

  it("calculates order appending after last item", () => {
    expect(calculateFractionalOrder(1000, null)).toBe(2000);
  });

  it("calculates midpoint between two items", () => {
    expect(calculateFractionalOrder(1000, 2000)).toBe(1500);
  });
});
