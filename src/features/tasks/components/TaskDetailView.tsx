"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { TaskPriority } from "@/types/tasks";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { TaskDetailDialog } from "@/features/kanban";
import { useTasks } from "@/features/tasks/hooks/useTasks";
import { calculateTaskProgress } from "@/features/tasks/utils/progress";
import { SubtaskList } from "./SubtaskList";

function priorityVariant(p: TaskPriority) {
  return p === "URGENT"
    ? "rose"
    : p === "HIGH"
    ? "amber"
    : p === "MEDIUM"
    ? "blue"
    : "default";
}

interface TaskDetailViewProps {
  projectId: string;
  taskId: string;
}

export function TaskDetailView({ projectId, taskId }: TaskDetailViewProps) {
  const router = useRouter();
  const {
    tasks,
    loading,
    updateTask,
    deleteTask,
    addSubtask,
    updateSubtask,
    toggleSubtask,
    removeSubtask,
  } = useTasks(projectId);

  const task = tasks.find((t) => t.id === taskId);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [confirmTaskDelete, setConfirmTaskDelete] = useState(false);
  const [subToDelete, setSubToDelete] = useState<{
    id: string;
    title: string;
  } | null>(null);

  const backHref = `/projects/${projectId}/tasks`;

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="h-32 rounded-lg border border-border bg-surface-card animate-pulse" />
      </div>
    );
  }

  if (!task) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center space-y-3">
        <p className="text-sm text-muted-foreground">Task not found.</p>
        <Link href={backHref} className="text-xs underline text-foreground">
          Back to Tasks
        </Link>
      </div>
    );
  }

  const progress = calculateTaskProgress(task);

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-5">
      <Link
        href={backHref}
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Tasks
      </Link>

      <div className="rounded-lg border border-border bg-surface-card p-4 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <h1 className="text-lg font-semibold text-foreground break-words">
            {task.title}
          </h1>
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => setIsEditOpen(true)}
              className="p-1.5 rounded hover:bg-surface-elevated text-muted-foreground hover:text-foreground"
              title="Edit task"
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setConfirmTaskDelete(true)}
              className="p-1.5 rounded hover:bg-surface-elevated text-muted-foreground hover:text-rose-400"
              title="Delete task"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs">
          <span className="font-mono px-2 py-0.5 rounded bg-surface-elevated border border-border text-foreground">
            {task.columnId}
          </span>
          <Badge variant={priorityVariant(task.priority)}>
            {task.priority}
          </Badge>
          <span className="font-mono text-muted-foreground">
            Due:{" "}
            {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "—"}
          </span>
        </div>

        {task.description && (
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
            {task.description}
          </p>
        )}

        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="font-semibold text-foreground">
            {progress.percentage}%
          </span>
          <div className="flex-1 h-1.5 bg-surface-elevated rounded-full overflow-hidden border border-border/40">
            <div
              className="h-full bg-emerald-400 rounded-full transition-all"
              style={{ width: `${progress.percentage}%` }}
            />
          </div>
          <span className="text-muted-foreground">
            {progress.completedSubtasks}/{progress.totalSubtasks} subtasks
          </span>
        </div>
      </div>

      <SubtaskList
        subtasks={task.subtasks || []}
        onToggle={(subId) => toggleSubtask(task.id, subId)}
        onUpdate={(subId, updates) => updateSubtask(task.id, subId, updates)}
        onAdd={(payload) => addSubtask(task.id, payload)}
        onRequestDelete={setSubToDelete}
      />

      <TaskDetailDialog
        task={task}
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onUpdate={updateTask}
      />

      <ConfirmDialog
        isOpen={Boolean(subToDelete)}
        onClose={() => setSubToDelete(null)}
        onConfirm={() => {
          if (subToDelete) removeSubtask(task.id, subToDelete.id);
        }}
        title="Delete Subtask"
        description={`Are you sure you want to delete "${subToDelete?.title}"?`}
        confirmLabel="Delete Subtask"
      />

      <ConfirmDialog
        isOpen={confirmTaskDelete}
        onClose={() => setConfirmTaskDelete(false)}
        onConfirm={async () => {
          await deleteTask(task.id);
          router.push(backHref);
        }}
        title="Delete Task"
        description={`Are you sure you want to delete "${task.title}"? Its subtasks will also be removed.`}
        confirmLabel="Delete Task"
      />
    </div>
  );
}
