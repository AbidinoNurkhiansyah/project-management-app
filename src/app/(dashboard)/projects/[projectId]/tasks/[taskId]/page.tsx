import React from "react";
import { TaskDetailView } from "@/features/tasks";

export default function TaskDetailPage({
  params,
}: {
  params: { projectId: string; taskId: string };
}) {
  return (
    <TaskDetailView projectId={params.projectId} taskId={params.taskId} />
  );
}
