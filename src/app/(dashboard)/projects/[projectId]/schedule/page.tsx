import React from "react";
import type { Metadata } from "next";
import { ScheduleView } from "@/features/schedule";

export const metadata: Metadata = {
  title: "Project Schedule",
};

export default function ProjectSchedulePage({
  params,
}: {
  params: { projectId: string };
}) {
  return <ScheduleView projectId={params.projectId} />;
}
