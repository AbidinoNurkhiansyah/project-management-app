"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { TaskPriority, TaskDoc } from "@/types/tasks";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { TaskCreateDialog, TaskDetailDialog } from "@/features/kanban";
import { useTasks } from "@/features/tasks/hooks/useTasks";
import { calculateTaskProgress } from "@/features/tasks/utils/progress";

const PRIORITY_RANK: Record<string, number> = {
  URGENT: 0,
  HIGH: 1,
  MEDIUM: 2,
  LOW: 3,
};

const GRID_TEMPLATE =
  "grid grid-cols-1 md:grid-cols-[minmax(200px,1fr)_120px_100px_120px_110px_70px] gap-2 items-center";

function getPriorityBadgeVariant(priority: TaskPriority) {
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
}

interface TaskListViewProps {
  projectId: string;
}

export function TaskListView({ projectId }: TaskListViewProps) {
  const router = useRouter();
  const { tasks, loading, createTask, updateTask, deleteTask } =
    useTasks(projectId);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TaskDoc | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<{
    taskId: string;
    title: string;
  } | null>(null);

  const activeSelectedTask =
    tasks.find((t) => t.id === selectedTask?.id) || selectedTask;

  const sortedTasks = useMemo(
    () =>
      [...tasks].sort((a, b) => {
        const pa = PRIORITY_RANK[a.priority] ?? 2;
        const pb = PRIORITY_RANK[b.priority] ?? 2;
        const ga = pa <= 1 ? pa : 2;
        const gb = pb <= 1 ? pb : 2;
        if (ga !== gb) return ga - gb;
        return b.order - a.order;
      }),
    [tasks]
  );

  const handleCreateTask = async (task: {
    projectId: string;
    title: string;
    description?: string | null;
    priority: TaskPriority;
    dueDate?: string | null;
    columnId: string;
  }) => {
    await createTask({
      projectId,
      title: task.title,
      description: task.description || null,
      priority: task.priority,
      dueDate: task.dueDate || null,
      columnId: task.columnId,
    });
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-4">
      <div className="sticky top-0 z-20 bg-surface-base/95 backdrop-blur-sm -mx-4 md:-mx-6 px-4 md:px-6 py-3 md:py-4 -mt-4 md:-mt-6 border-b border-border/40 flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-foreground">Tasks</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Track priorities, due dates, and subtask progress.
          </p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)} className="gap-1.5">
          <Plus className="w-3.5 h-3.5 shrink-0" />
          <span>Add Task</span>
        </Button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-20 rounded-lg border border-border bg-surface-card animate-pulse"
            />
          ))}
        </div>
      ) : tasks.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-border rounded-lg bg-surface-card/50">
          <h3 className="text-sm font-medium text-foreground">No tasks yet</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Create your first task to start tracking progress.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsCreateOpen(true)}
            className="mt-4"
          >
            + Add Task
          </Button>
        </div>
      ) : (
        <div className="space-y-2.5">
          <div
            className={`hidden md:grid ${GRID_TEMPLATE} px-4 py-2 text-[11px] font-mono text-muted-foreground uppercase border-b border-border/60 bg-surface-layout/40 rounded-md`}
          >
            <span>Task</span>
            <span>Status</span>
            <span>Priority</span>
            <span>Due Date</span>
            <span>Progress</span>
            <span className="text-right">Actions</span>
          </div>

          {sortedTasks.map((task) => {
            const subtasks = task.subtasks || [];
            const progress = calculateTaskProgress(task);

            return (
              <div
                key={task.id}
                className="rounded-lg border border-border bg-surface-card hover:border-zinc-700 transition-colors overflow-hidden"
              >
                <div
                  onClick={() =>
                    router.push(`/projects/${projectId}/tasks/${task.id}`)
                  }
                  className={`p-3 ${GRID_TEMPLATE} bg-surface-card cursor-pointer hover:bg-surface-hover/40`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-semibold text-sm text-foreground truncate">
                      {task.title}
                    </span>
                    {subtasks.length > 0 && (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-surface-elevated text-muted-foreground border border-border shrink-0">
                        {subtasks.length}
                      </span>
                    )}
                  </div>

                  <div>
                    <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-surface-elevated border border-border text-foreground">
                      {task.columnId}
                    </span>
                  </div>

                  <div>
                    <Badge variant={getPriorityBadgeVariant(task.priority)}>
                      {task.priority}
                    </Badge>
                  </div>

                  <div className="text-muted-foreground font-mono text-[11px]">
                    {task.dueDate
                      ? new Date(task.dueDate).toLocaleDateString()
                      : "—"}
                  </div>

                  <div className="flex items-center gap-2 font-mono text-xs">
                    <span className="font-semibold text-foreground">
                      {progress.percentage}%
                    </span>
                    <div className="w-14 h-1.5 bg-surface-elevated rounded-full overflow-hidden border border-border/40">
                      <div
                        className="h-full bg-emerald-400 rounded-full transition-all duration-300"
                        style={{ width: `${progress.percentage}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-1">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedTask(task);
                        setIsDetailOpen(true);
                      }}
                      className="p-1.5 rounded hover:bg-surface-elevated text-muted-foreground hover:text-foreground transition-colors"
                      title="Edit task"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setTaskToDelete({ taskId: task.id, title: task.title });
                      }}
                      className="p-1.5 rounded hover:bg-surface-elevated text-muted-foreground hover:text-rose-400 transition-colors"
                      title="Delete task"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <TaskCreateDialog
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        projectId={projectId}
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
            deleteTask(taskToDelete.taskId);
          }
        }}
        title="Delete Task"
        description={`Are you sure you want to delete "${taskToDelete?.title}"? Its subtasks will also be removed.`}
        confirmLabel="Delete Task"
      />
    </div>
  );
}
