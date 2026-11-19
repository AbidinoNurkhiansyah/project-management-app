import React from "react";
import { CanvasView } from "@/features/canvas";

export default function CanvasPage({
  params,
}: {
  params: { projectId: string };
}) {
  return <CanvasView projectId={params.projectId} />;
}
