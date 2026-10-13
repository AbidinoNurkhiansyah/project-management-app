import React from "react";
import { TaskPriority } from "@/types/tasks";

interface TaskCardHeaderProps {
  title: string;
  priority: TaskPriority;
}

const priorityColors: Record<TaskPriority, string> = {
  LOW: "text-zinc-400 bg-zinc-800/60 border-zinc-700/50",
  MEDIUM: "text-blue-400 bg-blue-950/40 border-blue-800/40",
  HIGH: "text-amber-400 bg-amber-950/40 border-amber-800/40",
  URGENT: "text-red-400 bg-red-950/40 border-red-800/40",
};

export function TaskCardHeader({ title, priority }: TaskCardHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-2">
      <h4 className="text-xs font-medium text-foreground line-clamp-2 leading-snug">
        {title}
      </h4>
      <span
        className={`px-1.5 py-0.5 rounded text-[10px] font-mono border ${priorityColors[priority]}`}
      >
        {priority}
      </span>
    </div>
  );
}
