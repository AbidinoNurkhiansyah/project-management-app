"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { TaskDoc } from "@/types/tasks";
import { TaskCardHeader } from "./TaskCardHeader";
import { TaskCardMeta } from "./TaskCardMeta";
import { calculateTaskProgress } from "@/lib/progress";
import { Pencil, Trash2, ChevronRight } from "lucide-react";

interface TaskCardProps {
  task: TaskDoc;
  onEdit: (task: TaskDoc) => void;
  onDelete?: (taskId: string) => void;
  onToggleSubtask?: (taskId: string, subtaskId: string) => void;
  onAddSubtask?: (taskId: string, title: string) => void;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}

export function TaskCard({ task, onEdit, onDelete }: TaskCardProps) {
  const router = useRouter();

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

  const progress = calculateTaskProgress(task);
  const subtasks = task.subtasks || [];

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => router.push(`/projects/${task.projectId}/tasks/${task.id}`)}
      className={`group relative p-2.5 rounded border border-border bg-surface-card hover:border-zinc-600 cursor-pointer active:cursor-grabbing transition-all ${
        isDragging ? "opacity-30 border-dashed" : "shadow-sm hover:shadow"
      }`}
    >
      {/* Top Header: Title, Priority, and Separate Edit Action Button */}
      <div className="flex items-start justify-between gap-1.5">
        <div className="flex-1 min-w-0">
          <TaskCardHeader title={task.title} priority={task.priority} />
        </div>

        {/* Dedicated Action Buttons */}
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-all shrink-0 -mr-1 -mt-0.5">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(task);
            }}
            className="p-1 rounded hover:bg-surface-elevated text-muted-foreground hover:text-foreground transition-all"
            title="Edit task details"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          {onDelete && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(task.id);
              }}
              className="p-1 rounded hover:bg-surface-elevated text-muted-foreground hover:text-rose-400 transition-all"
              title="Delete task"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>


      {/* Meta Footer */}
      <div className="flex items-center justify-between">
        <TaskCardMeta
          dueDate={task.dueDate}
          attachmentCount={task.attachments?.length ?? 0}
          hasGCal={Boolean(task.gcalEventId)}
          subtaskCount={
            subtasks.length > 0
              ? {
                  completed: progress.completedSubtasks,
                  total: progress.totalSubtasks,
                }
              : undefined
          }
        />


        <div className="mt-2 pt-1.5 flex items-center text-[10px] font-mono text-muted-foreground group-hover:text-foreground transition-colors">
          <span className="flex items-center gap-0.5">
            <span>Detail</span>
            <ChevronRight className="w-3 h-3" />
          </span>
        </div>
      </div>
    </div>
  );
}

