import React from "react";
import { Calendar, Paperclip, Zap, CheckSquare } from "lucide-react";

interface TaskCardMetaProps {
  dueDate: string | null;
  attachmentCount: number;
  hasGCal: boolean;
  subtaskCount?: { completed: number; total: number };
}

export function TaskCardMeta({
  dueDate,
  attachmentCount,
  hasGCal,
  subtaskCount,
}: TaskCardMetaProps) {
  const formattedDate = dueDate
    ? new Date(dueDate).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      })
    : null;

  return (
    <div className="flex items-center gap-2.5 mt-2 pt-1.5 border-t border-border/40 text-[10px] text-muted-foreground font-mono">
      {subtaskCount && subtaskCount.total > 0 && (
        <span
          className={`flex items-center gap-1 ${
            subtaskCount.completed === subtaskCount.total
              ? "text-emerald-400 font-semibold"
              : "text-muted-foreground"
          }`}
          title={`Subtasks: ${subtaskCount.completed}/${subtaskCount.total} done`}
        >
          <CheckSquare className="w-3 h-3 shrink-0" />
          <span>
            {subtaskCount.completed}/{subtaskCount.total}
          </span>
        </span>
      )}
      {formattedDate && (
        <span className="flex items-center gap-1">
          <Calendar className="w-3 h-3 shrink-0" />
          <span>{formattedDate}</span>
        </span>
      )}
      {attachmentCount > 0 && (
        <span className="flex items-center gap-1">
          <Paperclip className="w-3 h-3 shrink-0" />
          <span>{attachmentCount}</span>
        </span>
      )}
      {hasGCal && (
        <span className="flex items-center gap-1 text-amber-400" title="Synced to Google Calendar">
          <Zap className="w-3 h-3 shrink-0 fill-current" />
          <span>Sync</span>
        </span>
      )}
    </div>
  );
}
