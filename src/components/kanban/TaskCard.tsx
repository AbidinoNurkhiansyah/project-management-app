"use client";

import React, { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { TaskDoc } from "@/types/tasks";
import { TaskCardHeader } from "./TaskCardHeader";
import { TaskCardMeta } from "./TaskCardMeta";
import { ProgressBar } from "@/components/ui/progress";
import { calculateTaskProgress } from "@/lib/progress";
import {
  Pencil,
  Trash2,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Circle,
  Plus,
} from "lucide-react";

interface TaskCardProps {
  task: TaskDoc;
  onEdit: (task: TaskDoc) => void;
  onDelete?: (taskId: string) => void;
  onToggleSubtask?: (taskId: string, subtaskId: string) => void;
  onAddSubtask?: (taskId: string, title: string) => void;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}

export function TaskCard({
  task,
  onEdit,
  onDelete,
  onToggleSubtask,
  onAddSubtask,
  isExpanded: controlledExpanded,
  onToggleExpand,
}: TaskCardProps) {
  const [localExpanded, setLocalExpanded] = useState(false);
  const isExpanded = controlledExpanded !== undefined ? controlledExpanded : localExpanded;
  const toggleExpand = onToggleExpand || (() => setLocalExpanded((prev) => !prev));
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");

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

  const handleAddInlineSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!newSubtaskTitle.trim() || !onAddSubtask) return;
    onAddSubtask(task.id, newSubtaskTitle.trim());
    setNewSubtaskTitle("");
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => toggleExpand()}
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

      {/* Accordion Subtasks Section */}
      {isExpanded ? (
        <div
          onClick={(e) => e.stopPropagation()}
          className="mt-2.5 pt-2 border-t border-border/50 space-y-2 cursor-default"
        >
          {/* Header indicator */}
          <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground">
            <span className="font-semibold text-foreground flex items-center gap-1">
              <span>Subtasks</span>
              {subtasks.length > 0 && (
                <span className="text-[9px] px-1 rounded bg-surface-elevated">
                  {progress.completedSubtasks}/{progress.totalSubtasks}
                </span>
              )}
            </span>
            <button
              type="button"
              onClick={() => toggleExpand()}
              className="hover:text-foreground flex items-center gap-0.5 text-[10px]"
            >
              <span>Close</span>
              <ChevronUp className="w-3 h-3" />
            </button>
          </div>

          {subtasks.length > 0 && (
            <ProgressBar
              value={progress.percentage}
              size="sm"
              indicatorColor="hsl(var(--semantic-emerald))"
            />
          )}

          {/* Subtask list */}
          <div className="space-y-1 max-h-36 overflow-y-auto">
            {subtasks.map((sub) => (
              <div
                key={sub.id}
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleSubtask?.(task.id, sub.id);
                }}
                className="flex items-center gap-1.5 p-1 rounded hover:bg-surface-elevated text-xs cursor-pointer select-none transition-colors"
              >
                {sub.completed ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                ) : (
                  <Circle className="w-3.5 h-3.5 text-muted-foreground shrink-0 hover:text-foreground" />
                )}
                <span
                  className={
                    sub.completed
                      ? "line-through text-muted-foreground font-mono text-[11px]"
                      : "text-foreground text-[11px]"
                  }
                >
                  {sub.title}
                </span>
              </div>
            ))}
          </div>

          {/* Quick inline subtask input */}
          <form onSubmit={handleAddInlineSubtask} className="flex items-center gap-1 pt-0.5">
            <input
              type="text"
              value={newSubtaskTitle}
              onChange={(e) => setNewSubtaskTitle(e.target.value)}
              placeholder="+ Add subtask..."
              className="h-6 flex-1 bg-surface-base px-2 rounded text-[11px] border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-border-hover"
            />
            {newSubtaskTitle.trim() && (
              <button
                type="submit"
                className="h-6 px-1.5 rounded bg-surface-elevated hover:bg-zinc-700 text-foreground text-[10px] font-mono flex items-center gap-0.5 border border-border shrink-0"
              >
                <Plus className="w-2.5 h-2.5" />
                <span>Add</span>
              </button>
            )}
          </form>
        </div>
      ) : null}

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

        {!isExpanded && (
          <div className="mt-2 pt-1.5 flex items-center text-[10px] font-mono text-muted-foreground group-hover:text-foreground transition-colors">
            {subtasks.length > 0 ? (
              <span className="flex items-center gap-0.5">
                <span>{progress.completedSubtasks}/{progress.totalSubtasks}</span>
                <ChevronDown className="w-3 h-3" />
              </span>
            ) : (
              <span className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 text-[9px]">
                <span>+ Subtask</span>
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
