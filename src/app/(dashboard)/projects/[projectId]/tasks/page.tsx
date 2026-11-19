import React from "react";
import { TaskListView } from "@/features/tasks";

export default function TaskListPage({
  params,
}: {
  params: { projectId: string };
}) {
  return <TaskListView projectId={params.projectId} />;
}
