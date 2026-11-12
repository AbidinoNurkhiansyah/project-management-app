"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Pencil,
  Trash2,
  Plus,
  X,
  CheckCircle2,
  Circle,
} from "lucide-react";
import { TaskColumnStatus, TaskPriority } from "@/types/tasks";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TaskDetailDialog } from "@/components/kanban/TaskDetailDialog";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { useTasks } from "@/hooks/useTasks";
import { calculateTaskProgress } from "@/lib/progress";

const selectClass =
  "h-8 w-full rounded border border-border bg-surface-card px-2 text-xs text-foreground focus:outline-none";

const priorityVariant = (p: TaskPriority) =>
  p === "URGENT" ? "rose" : p === "HIGH" ? "amber" : p === "MEDIUM" ? "blue" : "default";

export default function TaskDetailPage({
  params,
}: {
  params: { projectId: string; taskId: string };
}) {
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
  } = useTasks(params.projectId);

  const task = tasks.find((t) => t.id === params.taskId);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [confirmTaskDelete, setConfirmTaskDelete] = useState(false);
  const [subToDelete, setSubToDelete] = useState<{ id: string; title: string } | null>(null);
  const [draft, setDraft] = useState<{
    title: string;
    status: TaskColumnStatus;
    priority: TaskPriority;
    dueDate: string;
  }>({ title: "", status: "TODO", priority: "MEDIUM", dueDate: "" });

  const backHref = `/projects/${params.projectId}/tasks`;

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
          Back to Task List
        </Link>
      </div>
    );
  }

  const subtasks = task.subtasks || [];
  const progress = calculateTaskProgress(task);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.title.trim()) return;
    await addSubtask(task.id, {
      title: draft.title.trim(),
      status: draft.status,
      priority: draft.priority,
      dueDate: draft.dueDate ? new Date(draft.dueDate).toISOString() : null,
    });
    setDraft({ title: "", status: "TODO", priority: "MEDIUM", dueDate: "" });
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-5">
      <Link
        href={backHref}
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Task List
      </Link>

      {/* Header */}
      <div className="rounded-lg border border-border bg-surface-card p-4 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <h1 className="text-lg font-semibold text-foreground break-words">{task.title}</h1>
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => setIsEditOpen(true)}
              className="p-1.5 rounded hover:bg-surface-elevated text-muted-foreground hover:text-foreground"
              title="Edit task details"
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
          <Badge variant={priorityVariant(task.priority)}>{task.priority}</Badge>
          <span className="font-mono text-muted-foreground">
            Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "—"}
          </span>
        </div>

        {task.description && (
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">{task.description}</p>
        )}

        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="font-semibold text-foreground">{progress.percentage}%</span>
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

      {/* Subtasks */}
      <div className="rounded-lg border border-border bg-surface-card">
        <div className="px-4 py-3 border-b border-border/60 text-sm font-semibold text-foreground">
          Subtasks
        </div>

        <div className="divide-y divide-border/30">
          {subtasks.length === 0 && (
            <p className="px-4 py-4 text-xs text-muted-foreground">No subtasks yet.</p>
          )}
          {subtasks.map((sub) => {
            const isDone = sub.status === "DONE" || sub.completed;
            const status = sub.status || (sub.completed ? "DONE" : "TODO");
            return (
              <div
                key={sub.id}
                className="px-4 py-2.5 grid grid-cols-1 md:grid-cols-[1fr_130px_110px_140px_32px] gap-2 items-center"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <button
                    type="button"
                    onClick={() => toggleSubtask(task.id, sub.id)}
                    title="Toggle complete"
                    className="shrink-0"
                  >
                    {isDone ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Circle className="w-4 h-4 text-muted-foreground" />
                    )}
                  </button>
                  <input
                    key={`${sub.id}-${sub.title}`}
                    type="text"
                    defaultValue={sub.title}
                    onBlur={(e) => {
                      const v = e.target.value.trim();
                      if (!v) {
                        e.target.value = sub.title;
                      } else if (v !== sub.title) {
                        updateSubtask(task.id, sub.id, { title: v });
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") e.currentTarget.blur();
                      if (e.key === "Escape") {
                        e.currentTarget.value = sub.title;
                        e.currentTarget.blur();
                      }
                    }}
                    className={`h-8 flex-1 min-w-0 rounded border border-transparent hover:border-border focus:border-border bg-transparent px-2 text-sm focus:outline-none ${
                      isDone ? "line-through text-muted-foreground" : "text-foreground"
                    }`}
                  />
                </div>
                <select
                  value={status}
                  onChange={(e) =>
                    updateSubtask(task.id, sub.id, {
                      status: e.target.value as TaskColumnStatus,
                    })
                  }
                  className={selectClass}
                >
                  <option value="TODO">To Do</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="DONE">Done</option>
                </select>
                <select
                  value={sub.priority || "MEDIUM"}
                  onChange={(e) =>
                    updateSubtask(task.id, sub.id, {
                      priority: e.target.value as TaskPriority,
                    })
                  }
                  className={selectClass}
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
                <input
                  type="date"
                  value={sub.dueDate ? sub.dueDate.split("T")[0] : ""}
                  onChange={(e) =>
                    updateSubtask(task.id, sub.id, {
                      dueDate: e.target.value ? new Date(e.target.value).toISOString() : null,
                    })
                  }
                  className={`${selectClass} font-mono`}
                />
                <button
                  type="button"
                  onClick={() => setSubToDelete({ id: sub.id, title: sub.title })}
                  className="p-1 rounded text-muted-foreground hover:text-rose-400 hover:bg-surface-elevated justify-self-end"
                  title="Delete subtask"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Add subtask */}
        <form
          onSubmit={handleAdd}
          className="px-4 py-3 border-t border-border/60 bg-surface-elevated/20 grid grid-cols-1 md:grid-cols-[1fr_130px_110px_140px_auto] gap-2 items-center"
        >
          <input
            type="text"
            value={draft.title}
            onChange={(e) => setDraft({ ...draft, title: e.target.value })}
            placeholder="+ Add subtask title..."
            className="h-8 bg-surface-card px-2 rounded text-xs border border-border text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
          <select
            value={draft.status}
            onChange={(e) => setDraft({ ...draft, status: e.target.value as TaskColumnStatus })}
            className={selectClass}
          >
            <option value="TODO">To Do</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="DONE">Done</option>
          </select>
          <select
            value={draft.priority}
            onChange={(e) => setDraft({ ...draft, priority: e.target.value as TaskPriority })}
            className={selectClass}
          >
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="URGENT">Urgent</option>
          </select>
          <input
            type="date"
            value={draft.dueDate}
            onChange={(e) => setDraft({ ...draft, dueDate: e.target.value })}
            className={`${selectClass} font-mono`}
          />
          <Button type="submit" size="sm" disabled={!draft.title.trim()} className="gap-1">
            <Plus className="w-3.5 h-3.5" /> Add
          </Button>
        </form>
      </div>

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
        description={`Are you sure you want to delete subtask "${subToDelete?.title}"? This will automatically recalculate project progress.`}
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
        description={`Are you sure you want to delete task "${task.title}"? All associated subtasks will also be permanently removed.`}
        confirmLabel="Delete Task"
      />
    </div>
  );
}

