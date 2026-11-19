import React from "react";
import { ProjectSettingsView } from "@/features/projects";

export default function ProjectSettingsPage({
  params,
}: {
  params: { projectId: string };
}) {
  return <ProjectSettingsView projectId={params.projectId} />;
}
