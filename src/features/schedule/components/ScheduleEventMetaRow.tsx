"use client";

import React from "react";
import { ProjectDoc } from "@/types/projects";
import { ScheduleCategory } from "@/types/schedule";
import {
  SCHEDULE_CATEGORIES,
  SCHEDULE_COLORS,
} from "../schemas/schedule.schema";
import { cn } from "@/lib/utils";

const CATEGORY_LABELS: Record<ScheduleCategory, string> = {
  EVENT: "Event",
  MEETING: "Meeting",
  TASK: "Task",
  REMINDER: "Reminder",
};

interface ScheduleEventMetaRowProps {
  category: ScheduleCategory;
  onCategoryChange: (cat: ScheduleCategory) => void;
  lockedProjectId: string | null;
  projectId: string;
  projects: ProjectDoc[];
  onProjectChange: (projectId: string) => void;
  color: string;
  onColorChange: (color: string) => void;
}

export function ScheduleEventMetaRow({
  category,
  onCategoryChange,
  lockedProjectId,
  projectId,
  projects,
  onProjectChange,
  color,
  onColorChange,
}: ScheduleEventMetaRowProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-3",
        lockedProjectId
          ? "sm:grid-cols-[minmax(0,1fr)_auto]"
          : "sm:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)_auto]",
      )}
    >
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-foreground">Category</label>
        <select
          value={category}
          onChange={(e) => onCategoryChange(e.target.value as ScheduleCategory)}
          className="flex h-9 w-full rounded-md border border-border bg-surface-card px-3 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-zinc-500"
        >
          {SCHEDULE_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {CATEGORY_LABELS[cat]}
            </option>
          ))}
        </select>
      </div>

      {!lockedProjectId && (
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-foreground">Project</label>
          <select
            value={projectId}
            onChange={(e) => onProjectChange(e.target.value)}
            className="flex h-9 w-full rounded-md border border-border bg-surface-card px-3 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-zinc-500"
          >
            <option value="">Personal (No Project)</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-foreground">Color</label>
        <div className="flex h-9 items-center gap-1.5">
          {SCHEDULE_COLORS.map((swatch) => (
            <button
              key={swatch}
              type="button"
              onClick={() => onColorChange(swatch)}
              aria-label={`Select color ${swatch}`}
              className={cn(
                "w-5 h-5 rounded-full transition-transform shrink-0",
                color === swatch
                  ? "ring-2 ring-white ring-offset-2 ring-offset-surface-elevated scale-110"
                  : "opacity-75 hover:opacity-100",
              )}
              style={{ backgroundColor: swatch }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
