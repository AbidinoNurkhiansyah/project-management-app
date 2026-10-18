"use client";

import React, { useState } from "react";
import { TaskPriority } from "@/types/tasks";
import { Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TaskCreateDialog } from "@/components/kanban/TaskCreateDialog";
import { useTasks } from "@/hooks/useTasks";

export default function TaskListPage({ params }: { params: { projectId: string } }) {
  const { tasks, loading, createTask } = useTasks(params.projectId);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const priorityBadgeVariant = (priority: TaskPriority) => {
    switch (priority) {
      case "URGENT":
        return "rose";
      case "HIGH":
        return "amber";
      case "MEDIUM":
        return "blue";
      default:
        return "default";
    }
  };

  const handleCreateTask = async (task: {
    projectId: string;
    title: string;
    description?: string | null;
    priority: TaskPriority;
    dueDate?: string | null;
    columnId: string;
  }) => {
    await createTask({
      projectId: params.projectId,
      title: task.title,
      description: task.description || null,
      priority: task.priority,
      dueDate: task.dueDate || null,
      columnId: task.columnId,
    });
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-foreground">All Tasks</h2>
          <p className="text-xs text-muted-foreground">
            High-density tabular list of work items.
          </p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)} className="gap-1.5">
          <Plus className="w-3.5 h-3.5 shrink-0" />
          <span>Add Task</span>
        </Button>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-10 rounded border border-border bg-surface-card animate-pulse"
            />
          ))}
        </div>
      ) : tasks.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-border rounded-lg bg-surface-card/50">
          <h3 className="text-sm font-medium text-foreground">No tasks found</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Create tasks to track progress across Kanban and Canvas.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsCreateOpen(true)}
            className="mt-4"
          >
            + Create First Task
          </Button>
        </div>
      ) : (
        <div className="rounded-md border border-border bg-surface-card overflow-hidden">
          <table className="w-full text-xs text-left">
            <thead className="bg-surface-layout text-muted-foreground uppercase border-b border-border">
              <tr>
                <th className="px-4 py-2.5 font-medium">Title</th>
                <th className="px-4 py-2.5 font-medium">Status</th>
                <th className="px-4 py-2.5 font-medium">Priority</th>
                <th className="px-4 py-2.5 font-medium">Due Date</th>
                <th className="px-4 py-2.5 font-medium">Attachments</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {tasks.map((task) => (
                <tr key={task.id} className="hover:bg-surface-hover transition-colors">
                  <td className="px-4 py-3 font-medium text-foreground">{task.title}</td>
                  <td className="px-4 py-3">
                    <span className="font-mono text-[11px] text-muted-foreground">
                      {task.columnId}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={priorityBadgeVariant(task.priority)}>
                      {task.priority}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground font-mono">
                    {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "—"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground font-mono">
                    {task.attachments?.length || 0} files
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <TaskCreateDialog
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        projectId={params.projectId}
        onCreate={handleCreateTask}
      />
    </div>
  );
}
