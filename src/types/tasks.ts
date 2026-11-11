import { BaseDocument, FileAttachment } from "./common";

export type TaskPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";
export type TaskColumnStatus = "TODO" | "IN_PROGRESS" | "DONE" | string;

export interface Subtask {
  id: string;
  title: string;
  status?: TaskColumnStatus;
  priority?: TaskPriority;
  dueDate?: string | null;
  completed: boolean;
  createdAt?: string;
}

export interface TaskDoc extends BaseDocument {
  projectId: string;
  boardId: string | null;
  columnId: TaskColumnStatus;
  order: number;
  title: string;
  description: string | null;
  dueDate: string | null;
  priority: TaskPriority;
  gcalEventId: string | null;
  attachments: FileAttachment[];
  subtasks?: Subtask[];
}
