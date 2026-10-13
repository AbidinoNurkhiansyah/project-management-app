import React from "react";

interface TaskCardMetaProps {
  dueDate: string | null;
  attachmentCount: number;
  hasGCal: boolean;
}

export function TaskCardMeta({
  dueDate,
  attachmentCount,
  hasGCal,
}: TaskCardMetaProps) {
  const formattedDate = dueDate
    ? new Date(dueDate).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      })
    : null;

  return (
    <div className="flex items-center gap-2 mt-2 pt-1.5 border-t border-border/40 text-[10px] text-muted-foreground font-mono">
      {formattedDate && (
        <span className="flex items-center gap-1">
          <span>📅</span>
          <span>{formattedDate}</span>
        </span>
      )}
      {attachmentCount > 0 && <span>📎 {attachmentCount}</span>}
      {hasGCal && <span title="Synced to Google Calendar">⚡ Sync</span>}
    </div>
  );
}
