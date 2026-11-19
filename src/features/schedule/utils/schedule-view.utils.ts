import {
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
  addDays,
  subDays,
  format,
  startOfWeek,
  endOfWeek,
} from "date-fns";
import {
  CalendarItem,
  ScheduleCategory,
  ScheduleViewMode,
} from "@/types/schedule";

export function stepScheduleDate(
  current: Date,
  viewMode: ScheduleViewMode,
  direction: "prev" | "next" | "today",
): Date {
  if (direction === "today") return new Date();
  const forward = direction === "next";
  if (viewMode === "month")
    return forward ? addMonths(current, 1) : subMonths(current, 1);
  if (viewMode === "week")
    return forward ? addWeeks(current, 1) : subWeeks(current, 1);
  return forward ? addDays(current, 1) : subDays(current, 1);
}

export function formatScheduleHeaderLabel(
  anchorDate: Date,
  viewMode: ScheduleViewMode,
): string {
  if (viewMode === "month") return format(anchorDate, "MMMM yyyy");
  if (viewMode === "day") return format(anchorDate, "EEEE, dd MMM yyyy");
  const wStart = startOfWeek(anchorDate, { weekStartsOn: 0 });
  const wEnd = endOfWeek(anchorDate, { weekStartsOn: 0 });
  return wStart.getMonth() === wEnd.getMonth()
    ? `${format(wStart, "MMM d")} – ${format(wEnd, "d, yyyy")}`
    : `${format(wStart, "MMM d")} – ${format(wEnd, "MMM d, yyyy")}`;
}

export function filterScheduleItems(
  items: CalendarItem[],
  params: {
    projectId: string | null;
    projectFilter: string;
    categoryFilter: ScheduleCategory | "ALL";
    searchQuery: string;
  },
): CalendarItem[] {
  const q = params.searchQuery.trim().toLowerCase();
  return items.filter((item) => {
    if (!params.projectId && params.projectFilter !== "ALL") {
      if (params.projectFilter === "PERSONAL" && item.projectId !== null)
        return false;
      if (
        params.projectFilter !== "PERSONAL" &&
        item.projectId !== params.projectFilter
      ) {
        return false;
      }
    }

    if (params.categoryFilter !== "ALL") {
      if (item.kind === "task") {
        if (params.categoryFilter !== "TASK") return false;
      } else if (item.category !== params.categoryFilter) {
        return false;
      }
    }

    if (q) {
      const desc =
        item.kind === "event"
          ? (item.event.description ?? "")
          : (item.description ?? "");
      const haystack =
        `${item.title} ${item.projectName ?? ""} ${desc}`.toLowerCase();
      if (!haystack.includes(q)) return false;
    }

    return true;
  });
}
