import { BaseDocument } from "@/types/common";
import { TaskPriority, TaskColumnStatus } from "@/types/tasks";

export type ScheduleCategory = "EVENT" | "TASK" | "MEETING" | "REMINDER";

export type ScheduleViewMode = "month" | "week" | "day";

export interface ScheduleLink {
  id: string;
  label: string;
  url: string;
}

export interface ScheduleEventDoc extends BaseDocument {
  projectId: string | null;
  taskId: string | null;
  title: string;
  description: string | null;
  startAt: string; // ISO 8601 string
  endAt: string;   // ISO 8601 string
  allDay: boolean;
  category: ScheduleCategory;
  color: string;
  links: ScheduleLink[];
}

export interface CalendarEventItem {
  kind: "event";
  id: string;
  title: string;
  start: Date;
  end: Date;
  allDay: boolean;
  color: string;
  projectId: string | null;
  projectName: string | null;
  category: ScheduleCategory;
  event: ScheduleEventDoc;
}

export interface CalendarTaskItem {
  kind: "task";
  id: string;
  title: string;
  start: Date;
  end: Date;
  allDay: true;
  color: string;
  projectId: string;
  projectName: string | null;
  priority: TaskPriority;
  status: TaskColumnStatus;
  taskId: string;
  description: string | null;
  dueDate: string;
}

export type CalendarItem = CalendarEventItem | CalendarTaskItem;
