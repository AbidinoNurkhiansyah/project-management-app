"use client";

import React, { useState } from "react";
import { KanbanBoard } from "@/components/kanban/KanbanBoard";
import { TaskCreateDialog } from "@/components/kanban/TaskCreateDialog";
import { TaskDetailDialog } from "@/components/kanban/TaskDetailDialog";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TaskPriority, TaskDoc } from "@/types/tasks";
import { useTasks } from "@/hooks/useTasks";

export default function KanbanPage({ params }: { params: { projectId: string } }) {
  const {
    tasks,
    loading,
    moveTask,
    createTask,
    updateTask,
    deleteTask,
    addSubtask,
    toggleSubtask,
    removeSubtask,
  } = useTasks(params.projectId);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TaskDoc | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<{ id: string; title: string } | null>(null);

  const activeSelectedTask = tasks.find((t) => t.id === selectedTask?.id) || selectedTask;

  const handleTaskReorder = async (taskId: string, targetColumn: string, newOrder: number) => {
    await moveTask(taskId, targetColumn, newOrder);
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
    <div className="flex flex-col h-[calc(100vh-48px)] p-4 md:p-6 space-y-4">
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h2 className="text-base font-semibold text-foreground">Kanban Board</h2>
          <p className="text-xs text-muted-foreground">
            Linear-style task tracking with fractional drag-and-drop order.
          </p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)} className="gap-1.5">
          <Plus className="w-3.5 h-3.5 shrink-0" />
          <span>Add Task</span>
        </Button>
      </div>

      <div className="flex-1 overflow-x-auto">
        {loading ? (
          <div className="flex gap-4">
            {[1, 2, 3].map((col) => (
              <div
                key={col}
                className="w-72 h-96 rounded-lg border border-border bg-surface-card animate-pulse"
              />
            ))}
          </div>
        ) : (
          <KanbanBoard
            tasks={tasks}
            onTaskReorder={handleTaskReorder}
            onTaskEdit={(task) => {
              setSelectedTask(task);
              setIsDetailOpen(true);
            }}
            onDeleteTask={(taskId) => {
              const target = tasks.find((t) => t.id === taskId);
              if (target) {
                setTaskToDelete({ id: target.id, title: target.title });
              }
            }}
            onToggleSubtask={toggleSubtask}
            onAddSubtask={addSubtask}
          />
        )}
      </div>

      <TaskCreateDialog
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        projectId={params.projectId}
        onCreate={handleCreateTask}
      />

      <TaskDetailDialog
        task={activeSelectedTask}
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setSelectedTask(null);
        }}
        onUpdate={updateTask}
      />

      <ConfirmDialog
        isOpen={Boolean(taskToDelete)}
        onClose={() => setTaskToDelete(null)}
        onConfirm={() => {
          if (taskToDelete) {
            deleteTask(taskToDelete.id);
          }
        }}
        title="Delete Task"
        description={`Are you sure you want to delete task "${taskToDelete?.title}"? All associated subtasks will also be permanently removed.`}
        confirmLabel="Delete Task"
      />
    </div>
  );
}
