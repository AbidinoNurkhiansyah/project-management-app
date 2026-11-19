import { z } from "zod";

export const SCHEDULE_CATEGORIES = ["EVENT", "MEETING", "TASK", "REMINDER"] as const;

export const SCHEDULE_COLORS = [
  "#3b82f6", // Blue
  "#10b981", // Emerald
  "#f59e0b", // Amber
  "#ef4444", // Red
  "#8b5cf6", // Violet
  "#ec4899", // Pink
  "#06b6d4", // Cyan
  "#71717a", // Zinc
] as const;

const SAFE_URL_PROTOCOLS = new Set(["http:", "https:"]);

export function normalizeExternalUrl(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  // Reject explicit non-http(s) schemes such as javascript:, data:, vbscript:, file:
  const schemeMatch = trimmed.match(/^([a-zA-Z][a-zA-Z0-9+.-]*):/);
  const candidate = schemeMatch ? trimmed : `https://${trimmed}`;

  try {
    const parsed = new URL(candidate);
    if (!SAFE_URL_PROTOCOLS.has(parsed.protocol)) {
      return null;
    }
    // Require a valid hostname with at least a dot or localhost
    if (!parsed.hostname || (!parsed.hostname.includes(".") && parsed.hostname !== "localhost")) {
      return null;
    }
    return parsed.toString();
  } catch {
    return null;
  }
}

export const scheduleLinkSchema = z.object({
  id: z.string().min(1),
  label: z.string().trim().max(80).default(""),
  url: z
    .string()
    .trim()
    .min(1, "URL is required")
    .refine((val) => normalizeExternalUrl(val) !== null, {
      message: "Enter a valid http:// or https:// URL",
    })
    .transform((val) => normalizeExternalUrl(val) as string),
});

const baseScheduleEventSchema = z.object({
  projectId: z.string().min(1).nullable().optional().default(null),
  taskId: z.string().min(1).nullable().optional().default(null),
  title: z.string().trim().min(1, "Title is required").max(160, "Title is too long"),
  description: z.string().trim().max(2000).nullable().optional().default(null),
  startAt: z.string().refine((v) => !Number.isNaN(Date.parse(v)), {
    message: "Invalid start date",
  }),
  endAt: z.string().refine((v) => !Number.isNaN(Date.parse(v)), {
    message: "Invalid end date",
  }),
  allDay: z.boolean().default(false),
  category: z.enum(SCHEDULE_CATEGORIES).default("EVENT"),
  color: z
    .string()
    .regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, "Invalid hex color")
    .default("#3b82f6"),
  links: z.array(scheduleLinkSchema).max(10).default([]),
});

export const scheduleEventCreateSchema = baseScheduleEventSchema.refine(
  (data) => Date.parse(data.endAt) >= Date.parse(data.startAt),
  {
    message: "End time must be after or equal to start time",
    path: ["endAt"],
  }
);

export const scheduleEventUpdateSchema = baseScheduleEventSchema
  .partial()
  .refine(
    (data) => {
      if (data.startAt && data.endAt) {
        return Date.parse(data.endAt) >= Date.parse(data.startAt);
      }
      return true;
    },
    {
      message: "End time must be after or equal to start time",
      path: ["endAt"],
    }
  );

export type ScheduleEventCreateInput = z.input<typeof scheduleEventCreateSchema>;
export type ScheduleEventUpdateInput = z.input<typeof scheduleEventUpdateSchema>;
