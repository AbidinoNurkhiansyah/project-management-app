"use client";

import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { TaskDoc } from "@/types/tasks";
import { TaskCardHeader } from "./TaskCardHeader";
import { TaskCardMeta } from "./TaskCardMeta";

interface TaskCardProps {
  task: TaskDoc;
  onEdit: (task: TaskDoc) => void;
}

export function TaskCard({ task, onEdit }: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id, data: { task } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => onEdit(task)}
      className={`group relative p-2.5 rounded border border-border bg-surface-card hover:border-zinc-700/80 cursor-grab active:cursor-grabbing transition-shadow ${
        isDragging ? "opacity-30 border-dashed" : "shadow-sm"
      }`}
    >
      <TaskCardHeader title={task.title} priority={task.priority} />
      <TaskCardMeta
        dueDate={task.dueDate}
        attachmentCount={task.attachments?.length ?? 0}
        hasGCal={Boolean(task.gcalEventId)}
      />
    </div>
  );
}
