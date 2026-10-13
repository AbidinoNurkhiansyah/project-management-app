import { describe, it, expect } from "vitest";
import { ProjectCreateInputSchema } from "@/schemas/project.schema";

describe("ProjectCreateInputSchema", () => {
  it("validates correct project creation payload", () => {
    const valid = {
      name: "Mobile App V2",
      description: "Q4 Roadmap project",
      color: "#3b82f6",
      icon: "layout",
    };
    const result = ProjectCreateInputSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it("fails when color is not a valid 6-char hex code", () => {
    const invalid = {
      name: "Project Bad Hex",
      color: "blue",
    };
    const result = ProjectCreateInputSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });
});
