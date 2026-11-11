"use client";

import React, { useState } from "react";
import { TaskPriority, TaskDoc, TaskColumnStatus } from "@/types/tasks";
import {
  Plus,
  Pencil,
  Trash2,
  ChevronDown,
  ChevronRight,
  Circle,
  CheckCircle2,
  X,
  CornerDownRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TaskCreateDialog } from "@/components/kanban/TaskCreateDialog";
import { TaskDetailDialog } from "@/components/kanban/TaskDetailDialog";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { useTasks } from "@/hooks/useTasks";
import { calculateTaskProgress } from "@/lib/progress";

export default function TaskListPage({ params }: { params: { projectId: string } }) {
  const {
    tasks,
    loading,
    createTask,
    updateTask,
    deleteTask,
    addSubtask,
    updateSubtask,
    toggleSubtask,
    removeSubtask,
  } = useTasks(params.projectId);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TaskDoc | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Confirmation modal states
  const [subtaskToDelete, setSubtaskToDelete] = useState<{
    taskId: string;
    subtaskId: string;
    title: string;
  } | null>(null);

  const [taskToDelete, setTaskToDelete] = useState<{
    taskId: string;
    title: string;
  } | null>(null);

  // Single active accordion: only 1 task can be expanded at a time to maintain focus
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);

  // Inline subtask draft state per task
  const [draftSubtasks, setDraftSubtasks] = useState<
    Record<
      string,
      {
        title: string;
        status: TaskColumnStatus;
        priority: TaskPriority;
        dueDate: string;
      }
    >
  >({});

  const activeSelectedTask = tasks.find((t) => t.id === selectedTask?.id) || selectedTask;

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

  const getDraft = (taskId: string) => {
    return (
      draftSubtasks[taskId] || {
        title: "",
        status: "TODO",
        priority: "MEDIUM",
        dueDate: "",
      }
    );
  };

  const updateDraft = (
    taskId: string,
    updates: Partial<{
      title: string;
      status: TaskColumnStatus;
      priority: TaskPriority;
      dueDate: string;
    }>
  ) => {
    setDraftSubtasks((prev) => ({
      ...prev,
      [taskId]: {
        ...getDraft(taskId),
        ...updates,
      },
    }));
  };

  const handleInlineAddSubtask = async (taskId: string, e: React.FormEvent) => {
    e.preventDefault();
    const draft = getDraft(taskId);
    if (!draft.title.trim()) return;

    await addSubtask(taskId, {
      title: draft.title.trim(),
      status: draft.status,
      priority: draft.priority,
      dueDate: draft.dueDate ? new Date(draft.dueDate).toISOString() : null,
    });

    updateDraft(taskId, {
      title: "",
      status: "TODO",
      priority: "MEDIUM",
      dueDate: "",
    });
  };

  const toggleExpand = (taskId: string) => {
    setExpandedTaskId((prev) => (prev === taskId ? null : taskId));
  };

  // Reusable Grid Columns Template
  const gridTemplate = "grid grid-cols-1 md:grid-cols-[minmax(200px,1fr)_120px_100px_120px_110px_70px] gap-2 items-center";

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-4">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-foreground">Task List</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Individual task records with structured column layout and unified internal subtasks.
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
        <div className="space-y-2.5">
          {/* Aligned Column Header (Desktop) */}
          <div className={`hidden md:grid ${gridTemplate} px-4 py-2 text-[11px] font-mono text-muted-foreground uppercase border-b border-border/60 bg-surface-layout/40 rounded-md`}>
            <span>Task & Subtask Title</span>
            <span>Status</span>
            <span>Priority</span>
            <span>Due Date</span>
            <span>Progress</span>
            <span className="text-right">Actions</span>
          </div>

          {/* List of Separated Task Records */}
          {tasks.map((task) => {
            const subtasks = task.subtasks || [];
            const hasSubtasks = subtasks.length > 0;
            const isExpanded = expandedTaskId === task.id;
            const progress = calculateTaskProgress(task);
            const draft = getDraft(task.id);

            return (
              <div
                key={task.id}
                className="rounded-lg border border-border bg-surface-card hover:border-zinc-700 transition-all overflow-hidden shadow-sm"
              >
                {/* Main Task Record Row (Aligned Columns) */}
                <div className={`p-3 ${gridTemplate} bg-surface-card`}>
                  {/* Column 1: Title with Chevron */}
                  <div className="flex items-center gap-2 min-w-0">
                    <button
                      type="button"
                      onClick={() => toggleExpand(task.id)}
                      className="p-0.5 rounded hover:bg-surface-elevated text-muted-foreground hover:text-foreground transition-colors shrink-0"
                      title={isExpanded ? "Collapse subtasks" : "Expand subtasks"}
                    >
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4 text-foreground" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </button>
                    <span className="font-semibold text-sm text-foreground truncate">
                      {task.title}
                    </span>
                    {hasSubtasks && (
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-surface-elevated text-muted-foreground border border-border shrink-0">
                        {subtasks.length}
                      </span>
                    )}
                  </div>

                  {/* Column 2: Status */}
                  <div>
                    <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-surface-elevated border border-border text-foreground">
                      {task.columnId}
                    </span>
                  </div>

                  {/* Column 3: Priority */}
                  <div>
                    <Badge variant={priorityBadgeVariant(task.priority)}>
                      {task.priority}
                    </Badge>
                  </div>

                  {/* Column 4: Due Date */}
                  <div className="text-muted-foreground font-mono text-[11px]">
                    {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "—"}
                  </div>

                  {/* Column 5: Progress */}
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

                  {/* Column 6: Actions */}
                  <div className="flex items-center justify-end gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedTask(task);
                        setIsDetailOpen(true);
                      }}
                      className="p-1.5 rounded hover:bg-surface-elevated text-muted-foreground hover:text-foreground transition-colors"
                      title="Edit task details"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setTaskToDelete({ taskId: task.id, title: task.title })
                      }
                      className="p-1.5 rounded hover:bg-surface-elevated text-muted-foreground hover:text-rose-400 transition-colors"
                      title="Delete task"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Unified Internal Subtasks Section (Disatukan di dalam Task Record ini) */}
                {isExpanded && (
                  <div className="border-t border-border/60 bg-surface-layout/40 divide-y divide-border/25">
                    {/* Subtask Rows (Aligned in the same column template) */}
                    {subtasks.map((sub) => {
                      const isDone = sub.status === "DONE" || sub.completed;
                      const subStatus = sub.status || (sub.completed ? "DONE" : "TODO");
                      const subPriority = sub.priority || "MEDIUM";

                      return (
                        <div
                          key={sub.id}
                          className={`px-3 py-2 ${gridTemplate} hover:bg-surface-hover/50 transition-colors text-xs`}
                        >
                          {/* Column 1: Subtask Title with Indent & Checkbox */}
                          <div className="flex items-center gap-2 pl-6 min-w-0">
                            <CornerDownRight className="w-3.5 h-3.5 text-muted-foreground/50 shrink-0" />
                            <button
                              type="button"
                              onClick={() => toggleSubtask(task.id, sub.id)}
                              className="text-muted-foreground hover:text-foreground shrink-0"
                              title="Toggle complete"
                            >
                              {isDone ? (
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                              ) : (
                                <Circle className="w-3.5 h-3.5 text-muted-foreground" />
                              )}
                            </button>
                            <span
                              className={
                                isDone
                                  ? "line-through text-muted-foreground font-mono text-[11px] truncate"
                                  : "text-foreground font-medium text-[11px] truncate"
                              }
                            >
                              {sub.title}
                            </span>
                          </div>

                          {/* Column 2: Subtask Status Select */}
                          <div>
                            <select
                              value={subStatus}
                              onChange={(e) =>
                                updateSubtask(task.id, sub.id, {
                                  status: e.target.value as TaskColumnStatus,
                                })
                              }
                              className="h-6 w-full rounded border border-border bg-surface-card px-1.5 text-[11px] text-foreground focus:outline-none"
                            >
                              <option value="TODO">To Do</option>
                              <option value="IN_PROGRESS">In Progress</option>
                              <option value="DONE">Done</option>
                            </select>
                          </div>

                          {/* Column 3: Subtask Priority Select */}
                          <div>
                            <select
                              value={subPriority}
                              onChange={(e) =>
                                updateSubtask(task.id, sub.id, {
                                  priority: e.target.value as TaskPriority,
                                })
                              }
                              className="h-6 w-full rounded border border-border bg-surface-card px-1.5 text-[11px] text-foreground focus:outline-none"
                            >
                              <option value="LOW">Low</option>
                              <option value="MEDIUM">Medium</option>
                              <option value="HIGH">High</option>
                              <option value="URGENT">Urgent</option>
                            </select>
                          </div>

                          {/* Column 4: Subtask Due Date */}
                          <div>
                            <input
                              type="date"
                              value={sub.dueDate ? sub.dueDate.split("T")[0] : ""}
                              onChange={(e) =>
                                updateSubtask(task.id, sub.id, {
                                  dueDate: e.target.value
                                    ? new Date(e.target.value).toISOString()
                                    : null,
                                })
                              }
                              className="h-6 w-full rounded border border-border bg-surface-card px-1.5 text-[10px] text-foreground font-mono focus:outline-none"
                            />
                          </div>

                          {/* Column 5: Subtask Status Indicator */}
                          <div className="font-mono text-[10px] text-muted-foreground">
                            {isDone ? (
                              <span className="text-emerald-400 font-semibold">Done</span>
                            ) : (
                              <span>Pending</span>
                            )}
                          </div>

                          {/* Column 6: Subtask Delete Action */}
                          <div className="flex items-center justify-end">
                            <button
                              type="button"
                              onClick={() =>
                                setSubtaskToDelete({
                                  taskId: task.id,
                                  subtaskId: sub.id,
                                  title: sub.title,
                                })
                              }
                              className="p-1 rounded text-muted-foreground hover:text-rose-400 hover:bg-surface-elevated transition-colors"
                              title="Delete subtask"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}

                    {/* Inline Add Subtask Row (Aligned to the same columns) */}
                    <form
                      onSubmit={(e) => handleInlineAddSubtask(task.id, e)}
                      className={`px-3 py-2 ${gridTemplate} bg-surface-elevated/20 text-xs`}
                    >
                      {/* Column 1: Title input */}
                      <div className="flex items-center gap-2 pl-6 min-w-0">
                        <Plus className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                        <input
                          type="text"
                          value={draft.title}
                          onChange={(e) =>
                            updateDraft(task.id, { title: e.target.value })
                          }
                          placeholder="+ Add subtask title..."
                          className="h-6 flex-1 bg-surface-card px-2 rounded text-xs border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-border-hover min-w-0"
                        />
                      </div>

                      {/* Column 2: Status select */}
                      <div>
                        <select
                          value={draft.status}
                          onChange={(e) =>
                            updateDraft(task.id, {
                              status: e.target.value as TaskColumnStatus,
                            })
                          }
                          className="h-6 w-full rounded border border-border bg-surface-card px-1.5 text-[11px] text-foreground focus:outline-none"
                        >
                          <option value="TODO">To Do</option>
                          <option value="IN_PROGRESS">In Progress</option>
                          <option value="DONE">Done</option>
                        </select>
                      </div>

                      {/* Column 3: Priority select */}
                      <div>
                        <select
                          value={draft.priority}
                          onChange={(e) =>
                            updateDraft(task.id, {
                              priority: e.target.value as TaskPriority,
                            })
                          }
                          className="h-6 w-full rounded border border-border bg-surface-card px-1.5 text-[11px] text-foreground focus:outline-none"
                        >
                          <option value="LOW">Low</option>
                          <option value="MEDIUM">Medium</option>
                          <option value="HIGH">High</option>
                          <option value="URGENT">Urgent</option>
                        </select>
                      </div>

                      {/* Column 4: Due date input */}
                      <div>
                        <input
                          type="date"
                          value={draft.dueDate}
                          onChange={(e) =>
                            updateDraft(task.id, { dueDate: e.target.value })
                          }
                          className="h-6 w-full rounded border border-border bg-surface-card px-1.5 text-[10px] text-foreground font-mono focus:outline-none"
                        />
                      </div>

                      {/* Column 5: Draft status preview */}
                      <div className="font-mono text-[10px] text-muted-foreground">
                        Draft
                      </div>

                      {/* Column 6: Add Button */}
                      <div className="flex items-center justify-end">
                        <Button
                          type="submit"
                          size="sm"
                          disabled={!draft.title.trim()}
                          className="h-6 px-2.5 text-[10px] font-mono shrink-0"
                        >
                          Add
                        </Button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Dialogs */}
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

      {/* Subtask Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(subtaskToDelete)}
        onClose={() => setSubtaskToDelete(null)}
        onConfirm={() => {
          if (subtaskToDelete) {
            removeSubtask(subtaskToDelete.taskId, subtaskToDelete.subtaskId);
          }
        }}
        title="Delete Subtask"
        description={`Are you sure you want to delete subtask "${subtaskToDelete?.title}"? This will automatically recalculate project progress.`}
        confirmLabel="Delete Subtask"
      />

      {/* Task Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(taskToDelete)}
        onClose={() => setTaskToDelete(null)}
        onConfirm={() => {
          if (taskToDelete) {
            deleteTask(taskToDelete.taskId);
          }
        }}
        title="Delete Task"
        description={`Are you sure you want to delete task "${taskToDelete?.title}"? All associated subtasks will also be permanently removed.`}
        confirmLabel="Delete Task"
      />
    </div>
  );
}
