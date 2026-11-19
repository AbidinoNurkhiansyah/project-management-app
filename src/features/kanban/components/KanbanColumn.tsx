"use client";

import React from "react";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { TaskDoc } from "@/types/tasks";
import { TaskCard } from "./TaskCard";

interface KanbanColumnProps {
  columnId: string;
  title: string;
  tasks: TaskDoc[];
  onTaskEdit: (task: TaskDoc) => void;
  onDeleteTask?: (taskId: string) => void;
  onToggleSubtask?: (taskId: string, subtaskId: string) => void;
  onAddSubtask?: (taskId: string, title: string) => void;
  expandedTaskId?: string | null;
  onToggleExpand?: (taskId: string) => void;
}

export function KanbanColumn({
  columnId,
  title,
  tasks,
  onTaskEdit,
  onDeleteTask,
  onToggleSubtask,
  onAddSubtask,
  expandedTaskId,
  onToggleExpand,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: columnId });

  return (
    <div
      ref={setNodeRef}
      className={`w-[290px] flex-shrink-0 flex flex-col rounded-md border border-border bg-surface-base/80 p-2 ${
        isOver ? "border-zinc-600 bg-surface-elevated/40" : ""
      }`}
    >
      <div className="flex items-center justify-between h-8 px-1 mb-2">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {title}
        </h3>
        <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-surface-card border border-border text-foreground">
          {tasks.length}
        </span>
      </div>

      <SortableContext
        items={tasks.map((t) => t.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="flex flex-col gap-2 min-h-[120px] overflow-y-auto">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={onTaskEdit}
              onDelete={onDeleteTask}
              onToggleSubtask={onToggleSubtask}
              onAddSubtask={onAddSubtask}
              isExpanded={expandedTaskId === task.id}
              onToggleExpand={onToggleExpand ? () => onToggleExpand(task.id) : undefined}
            />
          ))}
        </div>
      </SortableContext>
    </div>
  );
}
