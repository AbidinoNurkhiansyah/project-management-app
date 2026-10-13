"use client";

import React, { useState } from "react";
import { Dialog, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { TaskCreateInputSchema } from "@/schemas/task.schema";
import { TaskPriority } from "@/types/tasks";

interface TaskCreateDialogProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  defaultColumnId?: string;
  onCreate: (task: {
    projectId: string;
    title: string;
    description?: string | null;
    priority: TaskPriority;
    dueDate?: string | null;
    columnId: string;
  }) => Promise<void>;
}

export function TaskCreateDialog({
  isOpen,
  onClose,
  projectId,
  defaultColumnId = "TODO",
  onCreate,
}: TaskCreateDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("MEDIUM");
  const [dueDate, setDueDate] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const payload = {
      projectId,
      title,
      description: description.trim() || null,
      priority,
      columnId: defaultColumnId,
      dueDate: dueDate ? new Date(dueDate).toISOString() : null,
      order: 0,
      attachments: [],
    };

    const parseResult = TaskCreateInputSchema.safeParse(payload);
    if (!parseResult.success) {
      setError(parseResult.error.errors[0]?.message || "Validation failed");
      return;
    }

    try {
      setIsSubmitting(true);
      await onCreate({
        projectId,
        title,
        description: description.trim() || null,
        priority,
        dueDate: dueDate ? new Date(dueDate).toISOString() : null,
        columnId: defaultColumnId,
      });
      setTitle("");
      setDescription("");
      setPriority("MEDIUM");
      setDueDate("");
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create task");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogHeader>
        <DialogTitle>Create Task</DialogTitle>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-3.5">
        {error && (
          <div className="p-2 rounded bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
            {error}
          </div>
        )}

        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Task Title</label>
          <Input
            required
            autoFocus
            placeholder="e.g. Implement authentication guard"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as TaskPriority)}
              className="h-9 w-full rounded-md border border-border bg-surface-card px-2.5 text-xs text-foreground focus:outline-none"
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Due Date</label>
            <Input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="text-xs"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">Description (Optional)</label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Technical details, acceptance criteria..."
            className="w-full rounded-md border border-border bg-surface-card p-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-border-hover resize-none"
          />
        </div>

        <DialogFooter>
          <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting || !title.trim()}>
            {isSubmitting ? "Saving..." : "Create Task"}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}
