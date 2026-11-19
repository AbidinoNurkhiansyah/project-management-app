"use client";

import React from "react";
import { format, isSameMonth, isToday } from "date-fns";
import { CheckSquare, Link2 } from "lucide-react";
import { CalendarItem } from "@/types/schedule";
import { getMonthGridDays, getItemsForDay } from "../utils/calendar.utils";
import { cn } from "@/lib/utils";

interface MonthViewProps {
  anchorDate: Date;
  items: CalendarItem[];
  onSelectDateToCreate: (date: Date) => void;
  onSelectItem: (item: CalendarItem) => void;
  onShowMoreForDay: (date: Date) => void;
}

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MAX_VISIBLE_PER_DAY = 3;

export function MonthView({
  anchorDate,
  items,
  onSelectDateToCreate,
  onSelectItem,
  onShowMoreForDay,
}: MonthViewProps) {
  const days = getMonthGridDays(anchorDate);
  const weekCount = Math.max(5, Math.ceil(days.length / 7));

  return (
    <div className="flex flex-col flex-1 min-h-[600px] border border-border rounded-lg overflow-hidden bg-surface-card">
      {/* Weekday Header */}
      <div className="grid grid-cols-7 border-b border-border bg-surface-layout/80">
        {WEEKDAY_LABELS.map((label) => (
          <div
            key={label}
            className="py-2 px-2.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground text-center border-r border-border last:border-r-0"
          >
            {label}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div
        className="grid grid-cols-7 flex-1"
        style={{ gridTemplateRows: `repeat(${weekCount}, minmax(108px, 1fr))` }}
      >
        {days.map((day) => {
          const inCurrentMonth = isSameMonth(day, anchorDate);
          const today = isToday(day);
          const dayItems = getItemsForDay(items, day);
          const visible = dayItems.slice(0, MAX_VISIBLE_PER_DAY);
          const overflowCount = dayItems.length - visible.length;

          return (
            <div
              key={day.toISOString()}
              onClick={() => onSelectDateToCreate(day)}
              className={cn(
                "group border-r border-b border-border last:border-r-0 p-1.5 flex flex-col gap-1 cursor-pointer transition-colors hover:bg-surface-hover/40 min-w-0",
                !inCurrentMonth && "bg-surface-base/40 text-muted-foreground/50"
              )}
            >
              <div className="flex items-center justify-between px-0.5">
                <span
                  className={cn(
                    "inline-flex h-6 min-w-6 items-center justify-center rounded-full px-1.5 text-xs font-medium",
                    today
                      ? "bg-blue-500 text-white font-semibold"
                      : inCurrentMonth
                        ? "text-foreground"
                        : "text-muted-foreground/60"
                  )}
                >
                  {format(day, "d")}
                </span>
                <span className="opacity-0 group-hover:opacity-100 text-[10px] text-muted-foreground transition-opacity">
                  +
                </span>
              </div>

              <div className="flex flex-col gap-1 min-w-0">
                {visible.map((item) => {
                  const isTask = item.kind === "task";
                  const isDoneTask = isTask && item.status === "DONE";
                  const hasLinks =
                    item.kind === "event" && item.event.links.length > 0;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectItem(item);
                      }}
                      title={item.title}
                      className={cn(
                        "w-full text-left rounded px-1.5 py-0.5 text-[11px] leading-tight flex items-center gap-1 truncate border transition-opacity hover:opacity-90",
                        isDoneTask && "opacity-60 line-through"
                      )}
                      style={{
                        backgroundColor: `${item.color}20`,
                        borderColor: `${item.color}55`,
                        color: "var(--foreground)",
                      }}
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full shrink-0"
                        style={{ backgroundColor: item.color }}
                      />
                      {isTask && (
                        <CheckSquare className="w-2.5 h-2.5 shrink-0 text-muted-foreground" />
                      )}
                      {!item.allDay && (
                        <span className="text-[10px] text-muted-foreground shrink-0 font-mono">
                          {format(item.start, "HH:mm")}
                        </span>
                      )}
                      <span className="truncate font-medium">{item.title}</span>
                      {hasLinks && (
                        <Link2 className="w-2.5 h-2.5 shrink-0 text-blue-400 ml-auto" />
                      )}
                    </button>
                  );
                })}

                {overflowCount > 0 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onShowMoreForDay(day);
                    }}
                    className="text-left px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground hover:text-foreground transition-colors"
                  >
                    +{overflowCount} more
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
