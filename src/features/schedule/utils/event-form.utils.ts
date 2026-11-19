import { ProjectDoc } from "@/types/projects";
import { ScheduleEventDoc, ScheduleLink } from "@/types/schedule";
import {
  SCHEDULE_COLORS,
  normalizeExternalUrl,
  ScheduleEventCreateInput,
  scheduleEventCreateSchema,
} from "../schemas/schedule.schema";
import {
  toDateInputValue,
  toTimeInputValue,
  combineDateAndTime,
} from "./calendar.utils";

export interface DraftLink {
  id: string;
  label: string;
  url: string;
}

export function generateLinkId(): string {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }
  return `link-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function getDefaultCreateScheduleTimes(initialStartDate: Date | null) {
  const base = initialStartDate ? new Date(initialStartDate) : new Date();
  const hasSpecificTime =
    initialStartDate !== null &&
    (base.getHours() !== 0 || base.getMinutes() !== 0);
  const start = new Date(base);
  if (!hasSpecificTime) start.setHours(9, 0, 0, 0);
  const end = new Date(start.getTime() + 60 * 60 * 1000);
  return {
    startDate: toDateInputValue(start),
    startTime: toTimeInputValue(start),
    endDate: toDateInputValue(end),
    endTime: toTimeInputValue(end),
  };
}

export function getInitialEventColor(
  lockedProjectId: string | null,
  projects: ProjectDoc[],
): string {
  const proj = lockedProjectId
    ? projects.find((p) => p.id === lockedProjectId)
    : undefined;
  return proj?.color || SCHEDULE_COLORS[0];
}

export function validateAndBuildEventPayload(params: {
  title: string;
  description: string;
  category: ScheduleEventDoc["category"];
  allDay: boolean;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  projectId: string;
  lockedProjectId: string | null;
  color: string;
  links: DraftLink[];
  editingEvent: ScheduleEventDoc | null;
}): { ok: true; data: ScheduleEventCreateInput } | { ok: false; error: string } {
  if (!params.startDate || !params.endDate) {
    return { ok: false, error: "Start date and end date are required." };
  }

  const normalizedLinks: ScheduleLink[] = [];
  for (const row of params.links.filter(
    (l) => l.url.trim() !== "" || l.label.trim() !== "",
  )) {
    const normalized = normalizeExternalUrl(row.url);
    if (!normalized) {
      return {
        ok: false,
        error: `Invalid link URL: "${row.url || "(empty)"}". Use a valid http:// or https:// URL.`,
      };
    }
    normalizedLinks.push({
      id: row.id,
      label:
        row.label.trim() || new URL(normalized).hostname.replace(/^www\./, ""),
      url: normalized,
    });
  }

  const payload: ScheduleEventCreateInput = {
    title: params.title.trim(),
    description: params.description.trim() || null,
    category: params.category,
    allDay: params.allDay,
    startAt: combineDateAndTime(
      params.startDate,
      params.allDay ? "00:00" : params.startTime,
    ),
    endAt: combineDateAndTime(
      params.endDate,
      params.allDay ? "23:59" : params.endTime,
    ),
    projectId: params.lockedProjectId ?? (params.projectId || null),
    taskId: params.editingEvent?.taskId ?? null,
    color: params.color,
    links: normalizedLinks,
  };

  const parsed = scheduleEventCreateSchema.safeParse(payload);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message || "Please check your inputs.",
    };
  }
  return { ok: true, data: parsed.data };
}
