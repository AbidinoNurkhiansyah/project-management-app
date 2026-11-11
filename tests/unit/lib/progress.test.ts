import { describe, it, expect } from "vitest";
import {
  calculateTaskProgress,
  calculateProjectProgress,
  deriveParentTaskStatus,
} from "@/lib/progress";
import { TaskDoc } from "@/types/tasks";

describe("Progress Calculation Engine (Hierarchical Weighted)", () => {
  it("returns 0% when there are no tasks in the project", () => {
    const res = calculateProjectProgress([]);
    expect(res.percentage).toBe(0);
    expect(res.totalTasks).toBe(0);
    expect(res.weightPerTask).toBe(0);
  });

  it("calculates 50% when 1 of 2 tasks is DONE and other is IN_PROGRESS", () => {
    const tasks: Partial<TaskDoc>[] = [
      { id: "1", title: "Authentication", columnId: "DONE" },
      { id: "2", title: "Profile", columnId: "IN_PROGRESS" },
    ];
    const res = calculateProjectProgress(tasks);
    expect(res.totalTasks).toBe(2);
    expect(res.weightPerTask).toBe(50);
    expect(res.completedTasks).toBe(1);
    expect(res.percentage).toBe(50);
  });

  it("calculates 0% when all tasks are in TODO or IN_PROGRESS", () => {
    const tasks: Partial<TaskDoc>[] = [
      { id: "1", title: "Authentication", columnId: "TODO" },
      { id: "2", title: "Profile", columnId: "IN_PROGRESS" },
    ];
    const res = calculateProjectProgress(tasks);
    expect(res.percentage).toBe(0);
    expect(res.completedTasks).toBe(0);
  });

  it("calculates 100% when all tasks are DONE", () => {
    const tasks: Partial<TaskDoc>[] = [
      { id: "1", title: "Authentication", columnId: "DONE" },
      { id: "2", title: "Profile", columnId: "DONE" },
    ];
    const res = calculateProjectProgress(tasks);
    expect(res.percentage).toBe(100);
    expect(res.completedTasks).toBe(2);
  });

  it("correctly weights subtasks hierarchically: 1 task with 1 of 2 subtasks done + 1 task TODO = 25%", () => {
    const tasks: Partial<TaskDoc>[] = [
      {
        id: "1",
        title: "Authentication",
        columnId: "IN_PROGRESS",
        subtasks: [
          { id: "s1", title: "Firebase Setup", completed: true },
          { id: "s2", title: "OAuth Google", completed: false },
        ],
      },
      { id: "2", title: "Profile", columnId: "TODO" },
    ];
    const res = calculateProjectProgress(tasks);
    // Task 1 contributes 0.5 ratio, Task 2 contributes 0. Total = 0.5 / 2 = 25%
    expect(res.percentage).toBe(25);
    expect(res.effectiveCompleted).toBe(0.5);
  });

  it("correctly calculates 75% when task 1 (2 subtasks) has both done (50%) + task 2 (2 subtasks) has 1 done (25%)", () => {
    const tasks: Partial<TaskDoc>[] = [
      {
        id: "1",
        title: "Authentication",
        columnId: "DONE",
        subtasks: [
          { id: "s1", title: "Firebase Setup", completed: true },
          { id: "s2", title: "OAuth Google", completed: true },
        ],
      },
      {
        id: "2",
        title: "Profile",
        columnId: "IN_PROGRESS",
        subtasks: [
          { id: "s3", title: "Avatar upload", completed: true },
          { id: "s4", title: "Bio edit", completed: false },
        ],
      },
    ];
    const res = calculateProjectProgress(tasks);
    expect(res.percentage).toBe(75);
    expect(res.effectiveCompleted).toBe(1.5);
  });

  it("calculates individual task progress correctly", () => {
    const withoutSubtasks: Partial<TaskDoc> = {
      columnId: "DONE",
    };
    expect(calculateTaskProgress(withoutSubtasks).percentage).toBe(100);

    const withSubtasks: Partial<TaskDoc> = {
      subtasks: [
        { id: "1", title: "Part 1", completed: true },
        { id: "2", title: "Part 2", completed: false },
        { id: "3", title: "Part 3", completed: false },
      ],
    };
    const detail = calculateTaskProgress(withSubtasks);
    expect(detail.percentage).toBe(33);
    expect(detail.completedSubtasks).toBe(1);
    expect(detail.totalSubtasks).toBe(3);
    expect(detail.isCompleted).toBe(false);
  });

  describe("deriveParentTaskStatus", () => {
    it("returns IN_PROGRESS when at least one subtask is DONE or IN_PROGRESS", () => {
      const subtasks = [
        { id: "1", title: "Task 1", completed: true, status: "DONE" },
        { id: "2", title: "Task 2", completed: false, status: "TODO" },
      ];
      expect(deriveParentTaskStatus(subtasks, "TODO")).toBe("IN_PROGRESS");
    });

    it("returns DONE when all subtasks are DONE", () => {
      const subtasks = [
        { id: "1", title: "Task 1", completed: true, status: "DONE" },
        { id: "2", title: "Task 2", completed: true, status: "DONE" },
      ];
      expect(deriveParentTaskStatus(subtasks, "TODO")).toBe("DONE");
    });

    it("returns TODO when all subtasks are TODO", () => {
      const subtasks = [
        { id: "1", title: "Task 1", completed: false, status: "TODO" },
        { id: "2", title: "Task 2", completed: false, status: "TODO" },
      ];
      expect(deriveParentTaskStatus(subtasks, "TODO")).toBe("TODO");
    });

    it("preserves currentStatus when subtasks array is empty", () => {
      expect(deriveParentTaskStatus([], "IN_PROGRESS")).toBe("IN_PROGRESS");
    });
  });
});
