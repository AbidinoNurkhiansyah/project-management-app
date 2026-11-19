import React from "react";
import { KanbanView } from "@/features/kanban";

export default function KanbanPage({
  params,
}: {
  params: { projectId: string };
}) {
  return <KanbanView projectId={params.projectId} />;
}
