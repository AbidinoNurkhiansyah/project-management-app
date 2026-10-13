import { describe, it, expect } from "vitest";
import { cn } from "@/lib/utils";

describe("cn utility", () => {
  it("merges class names correctly", () => {
    const result = cn("p-4", "text-sm", false && "hidden", "text-white");
    expect(result).toBe("p-4 text-sm text-white");
  });

  it("resolves conflicting tailwind classes with last-wins semantics", () => {
    const result = cn("p-2", "p-4");
    expect(result).toBe("p-4");
  });
});
