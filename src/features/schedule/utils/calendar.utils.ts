import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  startOfDay,
  endOfDay,
  isValid,
  parseISO,
} from "date-fns";
import { CalendarItem, ScheduleEventDoc } from "@/types/schedule";
import { TaskDoc } from "@/types/tasks";
import { ProjectDoc } from "@/types/projects";

export {
  computeTimedItemsLayout,
  type PositionedTimedItem,
} from "./time-grid-layout";

export const HOURS_IN_DAY = Array.from({ length: 24 }, (_, i) => i);

/**
 * Returns all days needed to render a full Sunday-Saturday month grid.
 */
export function getMonthGridDays(anchorDate: Date): Date[] {
  const monthStart = startOfMonth(anchorDate);
  const monthEnd = endOfMonth(anchorDate);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  return eachDayOfInterval({ start: gridStart, end: gridEnd });
}

/**
 * Returns the 7 days (Sunday-Saturday) for the week containing anchorDate.
 */
export function getWeekDays(anchorDate: Date): Date[] {
  const start = startOfWeek(anchorDate, { weekStartsOn: 0 });
  const end = endOfWeek(anchorDate, { weekStartsOn: 0 });
  return eachDayOfInterval({ start, end });
}

/**
 * Safely parses an ISO or YYYY-MM-DD date string.
 * For date-only strings (YYYY-MM-DD), parses in local time to prevent UTC day shifts.
 */
export function parseSafeDate(value: string | null | undefined): Date | null {
  if (!value) return null;
  const dateOnlyMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (dateOnlyMatch) {
    const year = Number(dateOnlyMatch[1]);
    const month = Number(dateOnlyMatch[2]) - 1;
    const day = Number(dateOnlyMatch[3]);
    const localDate = new Date(year, month, day, 0, 0, 0, 0);
    return isValid(localDate) ? localDate : null;
  }
  const parsed = parseISO(value);
  return isValid(parsed) ? parsed : null;
}

export function eventsToCalendarItems(
  events: ScheduleEventDoc[],
  projectsById: Map<string, ProjectDoc>
): CalendarItem[] {
  const result: CalendarItem[] = [];

  for (const event of events) {
    const start = parseSafeDate(event.startAt);
    const end = parseSafeDate(event.endAt);
    if (!start || !end) continue;

    const safeEnd = end.getTime() < start.getTime() ? start : end;
    const project = event.projectId ? projectsById.get(event.projectId) : undefined;

    result.push({
      kind: "event",
      id: event.id,
      title: event.title,
      start,
      end: safeEnd,
      allDay: event.allDay,
      color: event.color || project?.color || "#3b82f6",
      projectId: event.projectId,
      projectName: project?.name ?? null,
      category: event.category,
      event,
    });
  }

  return result;
}

export function tasksToCalendarItems(
  tasks: TaskDoc[],
  projectsById: Map<string, ProjectDoc>
): CalendarItem[] {
  const result: CalendarItem[] = [];

  for (const task of tasks) {
    if (!task.dueDate) continue;
    const due = parseSafeDate(task.dueDate);
    if (!due) continue;

    const project = projectsById.get(task.projectId);
    const dayStart = startOfDay(due);
    const dayEnd = endOfDay(due);

    result.push({
      kind: "task",
      id: `task:${task.id}`,
      taskId: task.id,
      title: task.title,
      start: dayStart,
      end: dayEnd,
      allDay: true,
      color: project?.color || "#10b981",
      projectId: task.projectId,
      projectName: project?.name ?? null,
      priority: task.priority,
      status: task.columnId,
      description: task.description,
      dueDate: task.dueDate,
    });
  }

  return result;
}

/**
 * Checks whether a calendar item overlaps with the given calendar day.
 */
export function itemIntersectsDay(item: CalendarItem, day: Date): boolean {
  const dayStart = startOfDay(day).getTime();
  const dayEnd = endOfDay(day).getTime();
  const itemStart = item.start.getTime();
  const itemEnd = item.end.getTime();

  // For zero-duration events, check if start falls within the day
  if (itemStart === itemEnd) {
    return itemStart >= dayStart && itemStart <= dayEnd;
  }

  return itemStart <= dayEnd && itemEnd >= dayStart;
}

/**
 * Returns items intersecting a day, sorted: all-day first, then by start time, then title.
 */
export function getItemsForDay(items: CalendarItem[], day: Date): CalendarItem[] {
  return items
    .filter((item) => itemIntersectsDay(item, day))
    .sort((a, b) => {
      if (a.allDay !== b.allDay) return a.allDay ? -1 : 1;
      const diff = a.start.getTime() - b.start.getTime();
      if (diff !== 0) return diff;
      return a.title.localeCompare(b.title);
    });
}

/**
 * Formats a Date into `YYYY-MM-DD` (local time) for <input type="date" />.
 */
export function toDateInputValue(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * Formats a Date into `HH:mm` (local time) for <input type="time" />.
 */
export function toTimeInputValue(date: Date): string {
  const h = String(date.getHours()).padStart(2, "0");
  const m = String(date.getMinutes()).padStart(2, "0");
  return `${h}:${m}`;
}

/**
 * Combines `YYYY-MM-DD` and `HH:mm` into an ISO timestamp string.
 */
export function combineDateAndTime(dateStr: string, timeStr: string): string {
  const [y, mo, d] = dateStr.split("-").map(Number);
  const [h, mi] = timeStr.split(":").map(Number);
  const local = new Date(y, (mo || 1) - 1, d || 1, h || 0, mi || 0, 0, 0);
  return local.toISOString();
}
