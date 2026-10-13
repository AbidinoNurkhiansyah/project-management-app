import { describe, it, expect, beforeEach } from "vitest";
import { useProjectStore } from "@/store/useProjectStore";
import { slugify } from "@/lib/slug";

describe("slugify", () => {
  it("converts strings to url-friendly slugs", () => {
    expect(slugify("My Cool Project!")).toBe("my-cool-project");
  });
});

describe("useProjectStore", () => {
  beforeEach(() => {
    useProjectStore.setState({ activeProjectId: null, recentProjectIds: [] });
  });

  it("sets active project id and updates recent list", () => {
    useProjectStore.getState().setActiveProjectId("proj-123");
    expect(useProjectStore.getState().activeProjectId).toBe("proj-123");
    expect(useProjectStore.getState().recentProjectIds).toContain("proj-123");
  });
});
