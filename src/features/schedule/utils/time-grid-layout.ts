import { startOfDay, endOfDay, differenceInMinutes } from "date-fns";
import { CalendarItem } from "@/types/schedule";

export interface PositionedTimedItem {
  item: CalendarItem;
  topPercent: number;
  heightPercent: number;
  columnIndex: number;
  totalColumns: number;
}

const MINUTES_PER_DAY = 24 * 60;
const MIN_DURATION_MINUTES = 25;

interface ClampedTimedEntry {
  item: CalendarItem;
  startMinutes: number;
  endMinutes: number;
}

function itemIntersectsDayRange(
  item: CalendarItem,
  dayStartMs: number,
  dayEndMs: number,
): boolean {
  const itemStart = item.start.getTime();
  const itemEnd = item.end.getTime();
  if (itemStart === itemEnd) {
    return itemStart >= dayStartMs && itemStart <= dayEndMs;
  }
  return itemStart <= dayEndMs && itemEnd >= dayStartMs;
}

/**
 * Computes non-overlapping vertical & horizontal geometry for timed items on a single day.
 */
export function computeTimedItemsLayout(
  items: CalendarItem[],
  day: Date,
): PositionedTimedItem[] {
  const dayStart = startOfDay(day);
  const dayEnd = endOfDay(day);
  const dayStartMs = dayStart.getTime();
  const dayEndMs = dayEnd.getTime();

  const timed: ClampedTimedEntry[] = items
    .filter(
      (item) => !item.allDay && itemIntersectsDayRange(item, dayStartMs, dayEndMs),
    )
    .map((item) => {
      const clampedStart =
        item.start.getTime() < dayStartMs ? dayStart : item.start;
      const clampedEnd = item.end.getTime() > dayEndMs ? dayEnd : item.end;
      const startMinutes = Math.max(0, differenceInMinutes(clampedStart, dayStart));
      const rawEndMinutes = Math.min(
        MINUTES_PER_DAY,
        differenceInMinutes(clampedEnd, dayStart),
      );
      const endMinutes = Math.max(
        startMinutes + MIN_DURATION_MINUTES,
        rawEndMinutes,
      );
      return {
        item,
        startMinutes,
        endMinutes: Math.min(MINUTES_PER_DAY, endMinutes),
      };
    })
    .sort((a, b) =>
      a.startMinutes !== b.startMinutes
        ? a.startMinutes - b.startMinutes
        : b.endMinutes - a.endMinutes,
    );

  if (timed.length === 0) return [];

  const clusters: ClampedTimedEntry[][] = [];
  let currentCluster: ClampedTimedEntry[] = [];
  let clusterMaxEnd = -1;

  for (const entry of timed) {
    if (currentCluster.length === 0 || entry.startMinutes < clusterMaxEnd) {
      currentCluster.push(entry);
      clusterMaxEnd = Math.max(clusterMaxEnd, entry.endMinutes);
    } else {
      clusters.push(currentCluster);
      currentCluster = [entry];
      clusterMaxEnd = entry.endMinutes;
    }
  }
  if (currentCluster.length > 0) {
    clusters.push(currentCluster);
  }

  const positioned: PositionedTimedItem[] = [];

  for (const cluster of clusters) {
    const columnEndTimes: number[] = [];
    const assignments: { entry: ClampedTimedEntry; col: number }[] = [];

    for (const entry of cluster) {
      let assignedCol = columnEndTimes.findIndex(
        (endTime) => endTime <= entry.startMinutes,
      );
      if (assignedCol === -1) {
        assignedCol = columnEndTimes.length;
        columnEndTimes.push(entry.endMinutes);
      } else {
        columnEndTimes[assignedCol] = entry.endMinutes;
      }
      assignments.push({ entry, col: assignedCol });
    }

    const totalColumns = Math.max(1, columnEndTimes.length);
    for (const { entry, col } of assignments) {
      const topPercent = (entry.startMinutes / MINUTES_PER_DAY) * 100;
      const heightPercent = Math.max(
        (MIN_DURATION_MINUTES / MINUTES_PER_DAY) * 100,
        ((entry.endMinutes - entry.startMinutes) / MINUTES_PER_DAY) * 100,
      );
      positioned.push({
        item: entry.item,
        topPercent,
        heightPercent,
        columnIndex: col,
        totalColumns,
      });
    }
  }

  return positioned;
}
