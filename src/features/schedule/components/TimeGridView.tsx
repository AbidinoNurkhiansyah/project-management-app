"use client";

import React, { useEffect, useRef, useState } from "react";
import { format, isToday } from "date-fns";
import { Link2 } from "lucide-react";
import { CalendarItem } from "@/types/schedule";
import {
  HOURS_IN_DAY,
  getWeekDays,
  computeTimedItemsLayout,
} from "../utils/calendar.utils";
import { TimeGridAllDayStrip } from "./TimeGridAllDayStrip";
import { cn } from "@/lib/utils";

interface TimeGridViewProps {
  mode: "week" | "day";
  anchorDate: Date;
  items: CalendarItem[];
  onSelectSlotToCreate: (dateWithHour: Date) => void;
  onSelectItem: (item: CalendarItem) => void;
}

const HOUR_HEIGHT_PX = 56;
const TOTAL_HEIGHT_PX = HOUR_HEIGHT_PX * 24;

export function TimeGridView({
  mode,
  anchorDate,
  items,
  onSelectSlotToCreate,
  onSelectItem,
}: TimeGridViewProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [now, setNow] = useState<Date>(() => new Date());

  const days = mode === "week" ? getWeekDays(anchorDate) : [anchorDate];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 7.5 * HOUR_HEIGHT_PX;
    }
  }, [mode]);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  const nowTopPercent =
    ((now.getHours() * 60 + now.getMinutes()) / (24 * 60)) * 100;

  return (
    <div className="flex flex-col flex-1 min-h-[600px] max-h-[calc(100vh-210px)] border border-border rounded-lg overflow-hidden bg-surface-card">
      <div className="flex border-b border-border bg-surface-layout/90 shrink-0">
        <div className="w-16 shrink-0 border-r border-border flex items-center justify-center text-[10px] font-mono text-muted-foreground">
          TIME
        </div>
        <div
          className={cn(
            "grid flex-1",
            mode === "week" ? "grid-cols-7" : "grid-cols-1",
          )}
        >
          {days.map((day) => {
            const today = isToday(day);
            return (
              <div
                key={day.toISOString()}
                className="py-2 px-2 text-center border-r border-border last:border-r-0"
              >
                <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
                  {format(day, "EEE")}
                </div>
                <div
                  className={cn(
                    "mx-auto mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-full text-sm font-semibold",
                    today ? "bg-blue-500 text-white" : "text-foreground",
                  )}
                >
                  {format(day, "d")}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <TimeGridAllDayStrip
        mode={mode}
        days={days}
        items={items}
        onSelectItem={onSelectItem}
      />

      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <div
          className="flex relative"
          style={{ height: `${TOTAL_HEIGHT_PX}px` }}
        >
          <div className="w-16 shrink-0 border-r border-border relative select-none">
            {HOURS_IN_DAY.map((hour) => (
              <div
                key={hour}
                style={{ height: `${HOUR_HEIGHT_PX}px` }}
                className="relative pr-2 text-right"
              >
                <span className="text-[10px] font-mono text-muted-foreground relative -top-2">
                  {hour === 0 ? "" : `${String(hour).padStart(2, "0")}:00`}
                </span>
              </div>
            ))}
          </div>

          <div
            className={cn(
              "grid flex-1 relative",
              mode === "week" ? "grid-cols-7" : "grid-cols-1",
            )}
          >
            {days.map((day) => {
              const today = isToday(day);
              const positioned = computeTimedItemsLayout(items, day);

              return (
                <div
                  key={`col-${day.toISOString()}`}
                  className="relative border-r border-border last:border-r-0"
                >
                  {HOURS_IN_DAY.map((hour) => (
                    <div
                      key={hour}
                      style={{ height: `${HOUR_HEIGHT_PX}px` }}
                      onClick={() => {
                        const slot = new Date(day);
                        slot.setHours(hour, 0, 0, 0);
                        onSelectSlotToCreate(slot);
                      }}
                      className="border-b border-border/50 hover:bg-surface-hover/40 cursor-pointer transition-colors"
                    />
                  ))}

                  {today && (
                    <div
                      className="absolute left-0 right-0 z-20 pointer-events-none flex items-center"
                      style={{ top: `${nowTopPercent}%` }}
                    >
                      <span className="w-2 h-2 rounded-full bg-red-500 -ml-1 shrink-0" />
                      <div className="h-[1.5px] bg-red-500 flex-1" />
                    </div>
                  )}

                  {positioned.map(
                    ({
                      item,
                      topPercent,
                      heightPercent,
                      columnIndex,
                      totalColumns,
                    }) => {
                      const widthPct = 100 / totalColumns;
                      const leftPct = columnIndex * widthPct;
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
                          style={{
                            top: `${topPercent}%`,
                            height: `${heightPercent}%`,
                            left: `calc(${leftPct}% + 2px)`,
                            width: `calc(${widthPct}% - 4px)`,
                            backgroundColor: `${item.color}28`,
                            borderColor: `${item.color}88`,
                          }}
                          className="absolute z-10 rounded-md border px-1.5 py-1 text-left overflow-hidden hover:z-30 hover:brightness-110 transition-all shadow-sm"
                        >
                          <div className="flex items-center gap-1 min-w-0">
                            <span
                              className="w-1.5 h-1.5 rounded-full shrink-0"
                              style={{ backgroundColor: item.color }}
                            />
                            <span className="text-[11px] font-semibold text-foreground truncate">
                              {item.title}
                            </span>
                            {hasLinks && (
                              <Link2 className="w-2.5 h-2.5 shrink-0 text-blue-400 ml-auto" />
                            )}
                          </div>
                          <div className="text-[10px] text-muted-foreground font-mono truncate">
                            {format(item.start, "HH:mm")}–
                            {format(item.end, "HH:mm")}
                          </div>
                          {item.projectName && heightPercent > 4 && (
                            <div className="text-[10px] text-muted-foreground truncate">
                              {item.projectName}
                            </div>
                          )}
                        </button>
                      );
                    },
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
