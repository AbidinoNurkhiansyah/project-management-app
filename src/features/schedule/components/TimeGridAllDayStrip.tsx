"use client";

import React from "react";
import { CheckSquare, Link2 } from "lucide-react";
import { CalendarItem } from "@/types/schedule";
import { getItemsForDay } from "../utils/calendar.utils";
import { cn } from "@/lib/utils";

interface TimeGridAllDayStripProps {
  mode: "week" | "day";
  days: Date[];
  items: CalendarItem[];
  onSelectItem: (item: CalendarItem) => void;
}

export function TimeGridAllDayStrip({
  mode,
  days,
  items,
  onSelectItem,
}: TimeGridAllDayStripProps) {
  return (
    <div className="flex border-b border-border bg-surface-base/40 shrink-0">
      <div className="w-16 shrink-0 border-r border-border py-2 px-1.5 text-[10px] text-muted-foreground text-right">
        All day
      </div>
      <div
        className={cn(
          "grid flex-1",
          mode === "week" ? "grid-cols-7" : "grid-cols-1",
        )}
      >
        {days.map((day) => {
          const allDayItems = getItemsForDay(items, day).filter(
            (i) => i.allDay,
          );
          return (
            <div
              key={`allday-${day.toISOString()}`}
              className="p-1 border-r border-border last:border-r-0 min-h-[34px] space-y-1 min-w-0"
            >
              {allDayItems.map((item) => {
                const isTask = item.kind === "task";
                const isDoneTask = isTask && item.status === "DONE";
                const hasLinks =
                  item.kind === "event" && item.event.links.length > 0;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onSelectItem(item)}
                    className={cn(
                      "w-full text-left rounded px-1.5 py-0.5 text-[11px] flex items-center gap-1 truncate border transition-opacity hover:opacity-90",
                      isDoneTask && "opacity-60 line-through",
                    )}
                    style={{
                      backgroundColor: `${item.color}22`,
                      borderColor: `${item.color}55`,
                    }}
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    {isTask && (
                      <CheckSquare className="w-2.5 h-2.5 shrink-0 text-muted-foreground" />
                    )}
                    <span className="truncate font-medium">{item.title}</span>
                    {hasLinks && (
                      <Link2 className="w-2.5 h-2.5 shrink-0 text-blue-400 ml-auto" />
                    )}
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
