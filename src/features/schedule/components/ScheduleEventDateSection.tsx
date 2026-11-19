"use client";

import React from "react";
import { Calendar } from "lucide-react";
import { Input } from "@/components/ui/input";

interface ScheduleEventDateSectionProps {
  allDay: boolean;
  onAllDayChange: (value: boolean) => void;
  startDate: string;
  onStartDateChange: (value: string) => void;
  startTime: string;
  onStartTimeChange: (value: string) => void;
  endDate: string;
  onEndDateChange: (value: string) => void;
  endTime: string;
  onEndTimeChange: (value: string) => void;
}

export function ScheduleEventDateSection({
  allDay,
  onAllDayChange,
  startDate,
  onStartDateChange,
  startTime,
  onStartTimeChange,
  endDate,
  onEndDateChange,
  endTime,
  onEndTimeChange,
}: ScheduleEventDateSectionProps) {
  return (
    <div className="rounded-md border border-border bg-surface-card/60 p-3 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-foreground flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
          Date &amp; Time
        </span>
        <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer select-none">
          <input
            type="checkbox"
            checked={allDay}
            onChange={(e) => onAllDayChange(e.target.checked)}
            className="rounded border-border bg-surface-card accent-blue-500"
          />
          All day
        </label>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-[11px] text-muted-foreground">Start</label>
          <div className="flex gap-1.5">
            <Input
              type="date"
              value={startDate}
              onChange={(e) => onStartDateChange(e.target.value)}
              required
              className="text-xs"
            />
            {!allDay && (
              <Input
                type="time"
                value={startTime}
                onChange={(e) => onStartTimeChange(e.target.value)}
                required
                className="text-xs w-28 shrink-0"
              />
            )}
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[11px] text-muted-foreground">End</label>
          <div className="flex gap-1.5">
            <Input
              type="date"
              value={endDate}
              min={startDate}
              onChange={(e) => onEndDateChange(e.target.value)}
              required
              className="text-xs"
            />
            {!allDay && (
              <Input
                type="time"
                value={endTime}
                onChange={(e) => onEndTimeChange(e.target.value)}
                required
                className="text-xs w-28 shrink-0"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
