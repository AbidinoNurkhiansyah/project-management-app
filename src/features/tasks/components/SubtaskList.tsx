"use client";

import React, { useState } from "react";
import { Plus, X, CheckCircle2, Circle } from "lucide-react";
import { Subtask, TaskColumnStatus, TaskPriority } from "@/types/tasks";
import { Button } from "@/components/ui/button";

const SELECT_CLASS =
  "h-8 w-full rounded border border-border bg-surface-card px-2 text-xs text-foreground focus:outline-none";

interface SubtaskListProps {
  subtasks: Subtask[];
  onToggle: (subtaskId: string) => void;
  onUpdate: (
    subtaskId: string,
    updates: Partial<{
      title: string;
      status: TaskColumnStatus;
      priority: TaskPriority;
      dueDate: string | null;
    }>
  ) => void;
  onAdd: (payload: {
    title: string;
    status: TaskColumnStatus;
    priority: TaskPriority;
    dueDate: string | null;
  }) => Promise<void>;
  onRequestDelete: (subtask: { id: string; title: string }) => void;
}

export function SubtaskList({
  subtasks,
  onToggle,
  onUpdate,
  onAdd,
  onRequestDelete,
}: SubtaskListProps) {
  const [draft, setDraft] = useState<{
    title: string;
    status: TaskColumnStatus;
    priority: TaskPriority;
    dueDate: string;
  }>({ title: "", status: "TODO", priority: "MEDIUM", dueDate: "" });

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.title.trim()) return;
    await onAdd({
      title: draft.title.trim(),
      status: draft.status,
      priority: draft.priority,
      dueDate: draft.dueDate ? new Date(draft.dueDate).toISOString() : null,
    });
    setDraft({ title: "", status: "TODO", priority: "MEDIUM", dueDate: "" });
  };

  return (
    <div className="rounded-lg border border-border bg-surface-card">
      <div className="px-4 py-3 border-b border-border/60 text-sm font-semibold text-foreground">
        Subtasks
      </div>

      <div className="divide-y divide-border/30">
        {subtasks.length === 0 && (
          <p className="px-4 py-4 text-xs text-muted-foreground">
            No subtasks yet.
          </p>
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
                  onClick={() => onToggle(sub.id)}
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
                      onUpdate(sub.id, { title: v });
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
                    isDone
                      ? "line-through text-muted-foreground"
                      : "text-foreground"
                  }`}
                />
              </div>

              <select
                value={status}
                onChange={(e) =>
                  onUpdate(sub.id, {
                    status: e.target.value as TaskColumnStatus,
                  })
                }
                className={SELECT_CLASS}
              >
                <option value="TODO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="DONE">Done</option>
              </select>

              <select
                value={sub.priority || "MEDIUM"}
                onChange={(e) =>
                  onUpdate(sub.id, {
                    priority: e.target.value as TaskPriority,
                  })
                }
                className={SELECT_CLASS}
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
                  onUpdate(sub.id, {
                    dueDate: e.target.value
                      ? new Date(e.target.value).toISOString()
                      : null,
                  })
                }
                className={`${SELECT_CLASS} font-mono`}
              />

              <button
                type="button"
                onClick={() => onRequestDelete({ id: sub.id, title: sub.title })}
                className="p-1 rounded text-muted-foreground hover:text-rose-400 hover:bg-surface-elevated justify-self-end"
                title="Delete subtask"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>

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
          onChange={(e) =>
            setDraft({ ...draft, status: e.target.value as TaskColumnStatus })
          }
          className={SELECT_CLASS}
        >
          <option value="TODO">To Do</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="DONE">Done</option>
        </select>
        <select
          value={draft.priority}
          onChange={(e) =>
            setDraft({ ...draft, priority: e.target.value as TaskPriority })
          }
          className={SELECT_CLASS}
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
          className={`${SELECT_CLASS} font-mono`}
        />
        <Button
          type="submit"
          size="sm"
          disabled={!draft.title.trim()}
          className="gap-1"
        >
          <Plus className="w-3.5 h-3.5" /> Add
        </Button>
      </form>
    </div>
  );
}
