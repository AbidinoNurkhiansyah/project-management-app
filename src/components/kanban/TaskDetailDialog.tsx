"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TaskDoc, TaskPriority } from "@/types/tasks";
import { calculateTaskProgress, deriveParentTaskStatus } from "@/lib/progress";
import { Lock } from "lucide-react";

interface TaskDetailDialogProps {
  task: TaskDoc | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (taskId: string, updates: Partial<TaskDoc>) => Promise<void>;
}

export function TaskDetailDialog({
  task,
  isOpen,
  onClose,
  onUpdate,
}: TaskDetailDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("MEDIUM");
  const [columnId, setColumnId] = useState("TODO");
  const [dueDate, setDueDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (task) {
      setTitle(task.title || "");
      setDescription(task.description || "");
      setPriority(task.priority || "MEDIUM");
      const currentSubtasks = task.subtasks || [];
      const status =
        currentSubtasks.length > 0
          ? deriveParentTaskStatus(currentSubtasks, task.columnId)
          : task.columnId || "TODO";
      setColumnId(status);
      setDueDate(task.dueDate ? task.dueDate.split("T")[0] : "");
    }
  }, [task]);

  if (!task) return null;

  const hasSubtasks = (task.subtasks || []).length > 0;
  const progress = calculateTaskProgress(task);
  const effectiveStatus = hasSubtasks
    ? deriveParentTaskStatus(task.subtasks, task.columnId)
    : columnId;

  const handleSaveGeneral = async () => {
    if (!title.trim()) return;
    const finalColumnId = hasSubtasks
      ? deriveParentTaskStatus(task.subtasks, task.columnId)
      : columnId;

    try {
      setIsSubmitting(true);
      await onUpdate(task.id, {
        title: title.trim(),
        description: description.trim() || null,
        priority,
        columnId: finalColumnId,
        dueDate: dueDate ? new Date(dueDate).toISOString() : null,
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogHeader>
        <div className="flex items-center justify-between w-full pr-6">
          <DialogTitle className="text-sm font-semibold text-foreground">
            Task Details
          </DialogTitle>
          <span className="font-mono text-[11px] text-muted-foreground uppercase px-2 py-0.5 rounded bg-surface-elevated border border-border">
            {task.columnId}
          </span>
        </div>
      </DialogHeader>

      <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
        {/* Title & Status */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-medium text-muted-foreground">
            Title
          </label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Task title..."
            className="text-sm font-medium"
          />
        </div>

        {/* Priority & Status Column & Due Date */}
        <div className="grid grid-cols-3 gap-2.5">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-medium text-muted-foreground">
                Status
              </label>
              {hasSubtasks && (
                <span
                  className="text-[9px] font-mono text-amber-400 flex items-center gap-0.5"
                  title="Status is automatically controlled by subtasks"
                >
                  <Lock className="w-2.5 h-2.5" /> Auto
                </span>
              )}
            </div>
            <select
              value={effectiveStatus}
              disabled={hasSubtasks}
              onChange={(e) => setColumnId(e.target.value)}
              className={`h-8 w-full rounded border border-border bg-surface-card px-2 text-xs text-foreground focus:outline-none ${
                hasSubtasks
                  ? "opacity-60 cursor-not-allowed bg-surface-elevated/40"
                  : ""
              }`}
              title={
                hasSubtasks
                  ? "Status dikendalikan otomatis oleh progress subtask"
                  : "Ubah status task"
              }
            >
              <option value="TODO">To Do</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="DONE">Done</option>
            </select>
            {hasSubtasks && (
              <p className="text-[9px] font-mono text-muted-foreground/80">
                Managed by subtasks
              </p>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-medium text-muted-foreground">
              Priority
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as TaskPriority)}
              className="h-8 w-full rounded border border-border bg-surface-card px-2 text-xs text-foreground focus:outline-none"
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-medium text-muted-foreground">
              Due Date
            </label>
            <Input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="h-8 text-xs"
            />
          </div>
        </div>

        {/* Description */}
        <div className="space-y-1">
          <label className="text-[11px] font-medium text-muted-foreground">
            Description
          </label>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add a detailed description..."
            className="w-full rounded border border-border bg-surface-card p-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-border-hover resize-none"
          />
        </div>

        {/* Compact Subtask Progress Summary (Subtask editing is managed in accordion) */}
        {hasSubtasks && (
          <div className="p-2.5 rounded bg-surface-layout border border-border/60 flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <span>Subtasks</span>
              <span className="text-foreground font-semibold">
                ({progress.completedSubtasks}/{progress.totalSubtasks})
              </span>
            </div>
            <span className="text-emerald-400 font-medium">
              {progress.percentage}% completed
            </span>
          </div>
        )}
      </div>

      <DialogFooter className="flex items-center justify-end gap-2 pt-3 border-t border-border/50">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="h-8 text-xs"
        >
          Cancel
        </Button>
        <Button
          type="button"
          size="sm"
          onClick={handleSaveGeneral}
          disabled={isSubmitting || !title.trim()}
          className="h-8 text-xs"
        >
          {isSubmitting ? "Saving..." : "Save Changes"}
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
