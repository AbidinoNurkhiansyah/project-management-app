"use client";

import React from "react";
import {
  ChevronLeft,
  ChevronRight,
  Search,
  CheckSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProjectDoc } from "@/types/projects";
import { ScheduleCategory, ScheduleViewMode } from "@/types/schedule";
import { cn } from "@/lib/utils";

const VIEW_MODES: { value: ScheduleViewMode; label: string }[] = [
  { value: "month", label: "Month" },
  { value: "week", label: "Week" },
  { value: "day", label: "Day" },
];

const CATEGORY_FILTERS: { value: ScheduleCategory | "ALL"; label: string }[] = [
  { value: "ALL", label: "All" },
  { value: "EVENT", label: "Events" },
  { value: "MEETING", label: "Meetings" },
  { value: "TASK", label: "Tasks" },
  { value: "REMINDER", label: "Reminders" },
];

interface ScheduleToolbarProps {
  dateHeaderLabel: string;
  viewMode: ScheduleViewMode;
  onViewModeChange: (mode: ScheduleViewMode) => void;
  onNavigate: (direction: "prev" | "next" | "today") => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  categoryFilter: ScheduleCategory | "ALL";
  onCategoryFilterChange: (cat: ScheduleCategory | "ALL") => void;
  projectId: string | null;
  projectFilter: string;
  onProjectFilterChange: (val: string) => void;
  projects: ProjectDoc[];
  showProjectTasks: boolean;
  onToggleProjectTasks: () => void;
}

export function ScheduleToolbar({
  dateHeaderLabel,
  viewMode,
  onViewModeChange,
  onNavigate,
  searchQuery,
  onSearchChange,
  categoryFilter,
  onCategoryFilterChange,
  projectId,
  projectFilter,
  onProjectFilterChange,
  projects,
  showProjectTasks,
  onToggleProjectTasks,
}: ScheduleToolbarProps) {
  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-surface-card p-2.5">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onNavigate("today")}
            className="h-7 px-2.5 text-xs"
          >
            Today
          </Button>
          <div className="flex items-center rounded-md border border-border overflow-hidden">
            <button
              type="button"
              onClick={() => onNavigate("prev")}
              aria-label="Previous period"
              className="h-7 w-7 flex items-center justify-center text-muted-foreground hover:bg-surface-hover hover:text-foreground transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onNavigate("next")}
              aria-label="Next period"
              className="h-7 w-7 flex items-center justify-center text-muted-foreground hover:bg-surface-hover hover:text-foreground border-l border-border transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <h2 className="text-sm font-semibold text-foreground ml-1">
            {dateHeaderLabel}
          </h2>
        </div>

        <div className="flex items-center rounded-md border border-border bg-surface-base p-0.5">
          {VIEW_MODES.map((m) => (
            <button
              key={m.value}
              type="button"
              onClick={() => onViewModeChange(m.value)}
              className={cn(
                "h-6 px-2.5 rounded text-xs font-medium transition-colors",
                viewMode === m.value
                  ? "bg-surface-elevated text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative w-full sm:w-56">
          <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <Input
            placeholder="Search events or tasks..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="h-8 pl-8 text-xs"
          />
        </div>

        <div className="flex items-center gap-1 flex-wrap">
          {CATEGORY_FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => onCategoryFilterChange(f.value)}
              className={cn(
                "h-7 px-2.5 rounded-md border text-xs font-medium transition-colors",
                categoryFilter === f.value
                  ? "border-foreground/40 bg-surface-elevated text-foreground"
                  : "border-border bg-surface-card text-muted-foreground hover:text-foreground",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        {!projectId && (
          <select
            value={projectFilter}
            onChange={(e) => onProjectFilterChange(e.target.value)}
            aria-label="Filter by project"
            className="h-7 rounded-md border border-border bg-surface-card px-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-zinc-500"
          >
            <option value="ALL">All Projects &amp; Personal</option>
            <option value="PERSONAL">Personal Only</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        )}

        <button
          type="button"
          onClick={onToggleProjectTasks}
          className={cn(
            "h-7 px-2.5 rounded-md border text-xs font-medium flex items-center gap-1.5 transition-colors ml-auto",
            showProjectTasks
              ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
              : "border-border bg-surface-card text-muted-foreground hover:text-foreground",
          )}
        >
          <CheckSquare className="w-3.5 h-3.5" />
          <span>Due Tasks</span>
        </button>
      </div>
    </>
  );
}
