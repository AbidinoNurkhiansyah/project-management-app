import { describe, it, expect } from "vitest";
import {
  normalizeExternalUrl,
  scheduleEventCreateSchema,
} from "../schemas/schedule.schema";
import {
  getMonthGridDays,
  getWeekDays,
  parseSafeDate,
  eventsToCalendarItems,
  tasksToCalendarItems,
  getItemsForDay,
  computeTimedItemsLayout,
} from "./calendar.utils";
import { ScheduleEventDoc } from "@/types/schedule";
import { TaskDoc } from "@/types/tasks";
import { ProjectDoc } from "@/types/projects";

const mockProject: ProjectDoc = {
  id: "proj-1",
  userId: "u1",
  name: "Website Revamp",
  slug: "website-revamp",
  description: null,
  color: "#10b981",
  icon: null,
  isArchived: false,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

const projectsMap = new Map<string, ProjectDoc>([["proj-1", mockProject]]);

describe("normalizeExternalUrl", () => {
  it("prepends https:// when protocol is missing", () => {
    expect(normalizeExternalUrl("meet.google.com/abc-defg-hij")).toBe(
      "https://meet.google.com/abc-defg-hij"
    );
  });

  it("accepts valid http and https URLs", () => {
    expect(normalizeExternalUrl("https://figma.com/file/123")).toBe(
      "https://figma.com/file/123"
    );
    expect(normalizeExternalUrl("http://localhost:3000/docs")).toBe(
      "http://localhost:3000/docs"
    );
  });

  it("rejects dangerous protocols like javascript: and data:", () => {
    expect(normalizeExternalUrl("javascript:alert(1)")).toBeNull();
    expect(normalizeExternalUrl("data:text/html,<script>alert(1)</script>")).toBeNull();
    expect(normalizeExternalUrl("vbscript:msgbox(1)")).toBeNull();
  });

  it("rejects malformed strings", () => {
    expect(normalizeExternalUrl("")).toBeNull();
    expect(normalizeExternalUrl("not a url")).toBeNull();
    expect(normalizeExternalUrl("justword")).toBeNull();
  });
});

describe("scheduleEventCreateSchema", () => {
  it("validates a valid event with links", () => {
    const parsed = scheduleEventCreateSchema.parse({
      title: "Sprint Planning",
      startAt: "2026-05-10T09:00:00.000Z",
      endAt: "2026-05-10T10:00:00.000Z",
      allDay: false,
      category: "MEETING",
      color: "#3b82f6",
      projectId: "proj-1",
      links: [
        { id: "l1", label: "Meet", url: "meet.google.com/xyz" },
      ],
    });

    expect(parsed.links[0].url).toBe("https://meet.google.com/xyz");
    expect(parsed.projectId).toBe("proj-1");
  });

  it("rejects endAt earlier than startAt", () => {
    const res = scheduleEventCreateSchema.safeParse({
      title: "Invalid range",
      startAt: "2026-05-10T10:00:00.000Z",
      endAt: "2026-05-10T09:00:00.000Z",
      allDay: false,
    });
    expect(res.success).toBe(false);
  });

  it("rejects unsafe javascript: link", () => {
    const res = scheduleEventCreateSchema.safeParse({
      title: "XSS Test",
      startAt: "2026-05-10T09:00:00.000Z",
      endAt: "2026-05-10T10:00:00.000Z",
      links: [{ id: "l1", label: "Bad", url: "javascript:alert(1)" }],
    });
    expect(res.success).toBe(false);
  });
});

describe("calendar grid & item utilities", () => {
  it("generates full Sunday-Saturday weeks for month grid", () => {
    const days = getMonthGridDays(new Date(2026, 4, 15)); // May 2026
    expect(days.length % 7).toBe(0);
    expect(days[0].getDay()).toBe(0); // Sunday
    expect(days[days.length - 1].getDay()).toBe(6); // Saturday
  });

  it("generates 7 days for week view", () => {
    const days = getWeekDays(new Date(2026, 4, 15));
    expect(days).toHaveLength(7);
    expect(days[0].getDay()).toBe(0);
    expect(days[6].getDay()).toBe(6);
  });

  it("parses YYYY-MM-DD in local time without UTC shift", () => {
    const d = parseSafeDate("2026-05-15");
    expect(d).not.toBeNull();
    expect(d!.getFullYear()).toBe(2026);
    expect(d!.getMonth()).toBe(4);
    expect(d!.getDate()).toBe(15);
  });

  it("converts tasks with dueDate into all-day calendar items and skips tasks without dueDate", () => {
    const tasks: TaskDoc[] = [
      {
        id: "t1",
        userId: "u1",
        projectId: "proj-1",
        boardId: null,
        columnId: "TODO",
        order: 1000,
        title: "Ship Landing Page",
        description: "Final polish",
        dueDate: "2026-05-15",
        priority: "HIGH",
        gcalEventId: null,
        attachments: [],
        createdAt: "2026-05-01T00:00:00.000Z",
        updatedAt: "2026-05-01T00:00:00.000Z",
      },
      {
        id: "t2",
        userId: "u1",
        projectId: "proj-1",
        boardId: null,
        columnId: "TODO",
        order: 2000,
        title: "No due date",
        description: null,
        dueDate: null,
        priority: "LOW",
        gcalEventId: null,
        attachments: [],
        createdAt: "2026-05-01T00:00:00.000Z",
        updatedAt: "2026-05-01T00:00:00.000Z",
      },
    ];

    const items = tasksToCalendarItems(tasks, projectsMap);
    expect(items).toHaveLength(1);
    expect(items[0].kind).toBe("task");
    expect(items[0].allDay).toBe(true);
    expect(items[0].projectName).toBe("Website Revamp");
  });

  it("computes side-by-side columns for overlapping timed events", () => {
    const day = new Date(2026, 4, 15);
    const e1: ScheduleEventDoc = {
      id: "e1",
      userId: "u1",
      projectId: null,
      taskId: null,
      title: "Meeting A",
      description: null,
      startAt: new Date(2026, 4, 15, 9, 0).toISOString(),
      endAt: new Date(2026, 4, 15, 10, 30).toISOString(),
      allDay: false,
      category: "MEETING",
      color: "#3b82f6",
      links: [],
      createdAt: "2026-05-01T00:00:00.000Z",
      updatedAt: "2026-05-01T00:00:00.000Z",
    };
    const e2: ScheduleEventDoc = {
      ...e1,
      id: "e2",
      title: "Meeting B",
      startAt: new Date(2026, 4, 15, 10, 0).toISOString(),
      endAt: new Date(2026, 4, 15, 11, 0).toISOString(),
    };
    const e3: ScheduleEventDoc = {
      ...e1,
      id: "e3",
      title: "Afternoon Solo",
      startAt: new Date(2026, 4, 15, 14, 0).toISOString(),
      endAt: new Date(2026, 4, 15, 15, 0).toISOString(),
    };

    const items = eventsToCalendarItems([e1, e2, e3], projectsMap);
    expect(getItemsForDay(items, day)).toHaveLength(3);

    const layout = computeTimedItemsLayout(items, day);
    expect(layout).toHaveLength(3);

    const posA = layout.find((p) => p.item.id === "e1")!;
    const posB = layout.find((p) => p.item.id === "e2")!;
    const posC = layout.find((p) => p.item.id === "e3")!;

    expect(posA.totalColumns).toBe(2);
    expect(posB.totalColumns).toBe(2);
    expect(posA.columnIndex).not.toBe(posB.columnIndex);
    // Non-overlapping cluster gets full width (1 column)
    expect(posC.totalColumns).toBe(1);
    expect(posC.columnIndex).toBe(0);
  });
});
