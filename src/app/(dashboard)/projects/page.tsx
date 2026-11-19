import React from "react";
import type { Metadata } from "next";
import { ProjectsOverview } from "@/features/projects";

export const metadata: Metadata = {
  title: "Projects",
};

export default function ProjectsPage() {
  return <ProjectsOverview />;
}
