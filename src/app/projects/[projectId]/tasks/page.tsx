"use client";

import React, { useState } from "react";
import { TaskDoc, TaskPriority } from "@/types/tasks";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { TaskCreateDialog } from "@/components/kanban/TaskCreateDialog";

const INITIAL_TASKS: TaskDoc[] = [
  {
    id: "task-1",
    userId: "user-1",
    projectId: "proj-1",
    boardId: null,
    columnId: "TODO",
    order: 1000,
    title: "Configure Cloudflare R2 bucket CORS",
    description: "Allow client-direct PUT uploads without zero egress fees",
    dueDate: "2026-10-15T12:00:00.000Z",
    priority: "HIGH",
    gcalEventId: null,
    attachments: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "task-2",
    userId: "user-1",
    projectId: "proj-1",
    boardId: null,
    columnId: "IN_PROGRESS",
    order: 2000,
    title: "Implement AES-256-GCM token cipher",
    description: "Secure OAuth tokens for Google Calendar integration",
    dueDate: "2026-10-14T18:00:00.000Z",
    priority: "URGENT",
    gcalEventId: "gcal-123",
    attachments: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export default function TaskListPage({ params }: { params: { projectId: string } }) {
  const [tasks, setTasks] = useState<TaskDoc[]>(INITIAL_TASKS);
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
    const newTask: TaskDoc = {
      id: `task-${Date.now()}`,
      userId: "user-1",
      projectId: params.projectId,
      boardId: null,
      columnId: task.columnId,
      order: Date.now(),
      title: task.title,
      description: task.description || null,
      dueDate: task.dueDate || null,
      priority: task.priority,
      gcalEventId: null,
      attachments: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setTasks((prev) => [newTask, ...prev]);
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
          <span>+</span> Add Task
        </Button>
      </div>

      <div className="rounded-lg border border-border bg-surface-card overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border bg-surface-layout text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              <th className="py-2.5 px-3">Title</th>
              <th className="py-2.5 px-3">Status</th>
              <th className="py-2.5 px-3">Priority</th>
              <th className="py-2.5 px-3">Due Date</th>
              <th className="py-2.5 px-3 text-right">Integrations</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60 text-xs">
            {tasks.map((task) => (
              <tr key={task.id} className="hover:bg-surface-hover/50 transition-colors">
                <td className="py-2.5 px-3 font-medium text-foreground">
                  {task.title}
                  {task.description && (
                    <p className="text-[11px] text-muted-foreground line-clamp-1">
                      {task.description}
                    </p>
                  )}
                </td>
                <td className="py-2.5 px-3">
                  <span className="font-mono text-[11px] text-muted-foreground">
                    {task.columnId}
                  </span>
                </td>
                <td className="py-2.5 px-3">
                  <Badge variant={priorityBadgeVariant(task.priority)}>
                    {task.priority}
                  </Badge>
                </td>
                <td className="py-2.5 px-3 text-muted-foreground font-mono text-[11px]">
                  {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "—"}
                </td>
                <td className="py-2.5 px-3 text-right">
                  {task.gcalEventId ? (
                    <span title="Synced with Google Calendar" className="text-xs">
                      📅
                    </span>
                  ) : (
                    <span className="text-muted-foreground text-[11px]">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <TaskCreateDialog
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        projectId={params.projectId}
        onCreate={handleCreateTask}
      />
    </div>
  );
}
