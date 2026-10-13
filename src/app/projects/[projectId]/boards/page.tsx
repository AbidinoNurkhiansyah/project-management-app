"use client";

import React, { useState } from "react";
import { KanbanBoard } from "@/components/kanban/KanbanBoard";
import { TaskCreateDialog } from "@/components/kanban/TaskCreateDialog";
import { Button } from "@/components/ui/Button";
import { TaskDoc, TaskPriority } from "@/types/tasks";

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
    dueDate: new Date(Date.now() + 86400000 * 2).toISOString(),
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
    dueDate: new Date(Date.now() + 86400000).toISOString(),
    priority: "URGENT",
    gcalEventId: "gcal-123",
    attachments: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "task-3",
    userId: "user-1",
    projectId: "proj-1",
    boardId: null,
    columnId: "DONE",
    order: 3000,
    title: "Setup Vitest and Tailwind utility",
    description: "Verify cn helper with twMerge and clsx",
    dueDate: null,
    priority: "MEDIUM",
    gcalEventId: null,
    attachments: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export default function KanbanPage({ params }: { params: { projectId: string } }) {
  const [tasks, setTasks] = useState<TaskDoc[]>(INITIAL_TASKS);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const handleTaskReorder = (taskId: string, targetColumn: string, newOrder: number) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId ? { ...t, columnId: targetColumn, order: newOrder } : t
      )
    );
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
    <div className="flex flex-col h-[calc(100vh-48px)] p-4 md:p-6 space-y-4">
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h2 className="text-base font-semibold text-foreground">Kanban Board</h2>
          <p className="text-xs text-muted-foreground">
            Linear-style task tracking with fractional drag-and-drop order.
          </p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)} className="gap-1.5">
          <span>+</span> Add Task
        </Button>
      </div>

      <div className="flex-1 overflow-x-auto">
        <KanbanBoard
          tasks={tasks}
          onTaskReorder={handleTaskReorder}
          onTaskEdit={() => {}}
        />
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
