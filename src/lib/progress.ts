import { TaskDoc, Subtask, TaskColumnStatus } from "@/types/tasks";

export interface TaskProgressDetail {
  ratio: number; // 0.0 to 1.0
  percentage: number; // 0 to 100
  hasSubtasks: boolean;
  totalSubtasks: number;
  completedSubtasks: number;
  isCompleted: boolean;
}

export interface ProjectProgressResult {
  percentage: number; // 0 to 100
  totalTasks: number;
  completedTasks: number;
  effectiveCompleted: number; // e.g. 1.5 if one task done and another 50%
  inProgressTasks: number;
  todoTasks: number;
  weightPerTask: number; // e.g. 50% when 2 tasks
}

export function calculateTaskProgress(task: Partial<TaskDoc>): TaskProgressDetail {
  const subtasks = task.subtasks || [];
  const totalSubtasks = subtasks.length;

  if (totalSubtasks > 0) {
    const completedSubtasks = subtasks.filter(
      (s) => s.status === "DONE" || s.completed
    ).length;
    const ratio = completedSubtasks / totalSubtasks;
    return {
      ratio,
      percentage: Math.round(ratio * 100),
      hasSubtasks: true,
      totalSubtasks,
      completedSubtasks,
      isCompleted: completedSubtasks === totalSubtasks,
    };
  }

  const isCompleted = task.columnId === "DONE";
  const ratio = isCompleted ? 1 : 0;
  return {
    ratio,
    percentage: isCompleted ? 100 : 0,
    hasSubtasks: false,
    totalSubtasks: 0,
    completedSubtasks: 0,
    isCompleted,
  };
}

export function calculateProjectProgress(tasks: Partial<TaskDoc>[]): ProjectProgressResult {
  const totalTasks = tasks.length;
  if (totalTasks === 0) {
    return {
      percentage: 0,
      totalTasks: 0,
      completedTasks: 0,
      effectiveCompleted: 0,
      inProgressTasks: 0,
      todoTasks: 0,
      weightPerTask: 0,
    };
  }

  let effectiveCompleted = 0;
  let fullyCompletedTasks = 0;
  let inProgressTasks = 0;
  let todoTasks = 0;

  for (const task of tasks) {
    const detail = calculateTaskProgress(task);
    effectiveCompleted += detail.ratio;

    if (detail.ratio === 1) {
      fullyCompletedTasks += 1;
    } else if (detail.ratio > 0 || task.columnId === "IN_PROGRESS") {
      inProgressTasks += 1;
    } else {
      todoTasks += 1;
    }
  }

  const weightPerTask = parseFloat((100 / totalTasks).toFixed(1));
  const rawPercentage = (effectiveCompleted / totalTasks) * 100;
  const percentage = Math.min(100, Math.max(0, Math.round(rawPercentage)));

  return {
    percentage,
    totalTasks,
    completedTasks: fullyCompletedTasks,
    effectiveCompleted: parseFloat(effectiveCompleted.toFixed(2)),
    inProgressTasks,
    todoTasks,
    weightPerTask,
  };
}

/**
 * Automatically calculates the parent task's column status based on its subtasks:
 * - If all subtasks are DONE -> parent status becomes "DONE"
 * - If at least 1 subtask is DONE or IN_PROGRESS -> parent status becomes "IN_PROGRESS"
 * - If all subtasks are TODO -> parent status becomes "TODO"
 * - If no subtasks exist -> preserves current status
 */
export function deriveParentTaskStatus(
  subtasks: Subtask[] | undefined,
  currentStatus: TaskColumnStatus = "TODO"
): TaskColumnStatus {
  if (!subtasks || subtasks.length === 0) {
    return currentStatus;
  }
  const doneCount = subtasks.filter(
    (s) => s.status === "DONE" || s.completed
  ).length;

  if (doneCount === subtasks.length) {
    return "DONE";
  }

  const hasStarted = subtasks.some(
    (s) => s.status === "IN_PROGRESS" || s.status === "DONE" || s.completed
  );

  if (hasStarted) {
    return "IN_PROGRESS";
  }

  return "TODO";
}
