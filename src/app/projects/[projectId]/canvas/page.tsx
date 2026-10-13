"use client";

import React, { useState } from "react";
import { CanvasBoard } from "@/components/canvas/CanvasBoard";
import { BoardCanvasData } from "@/types/boards";

const INITIAL_CANVAS_DATA: BoardCanvasData = {
  nodes: [
    {
      id: "node-1",
      type: "taskNode",
      position: { x: 200, y: 150 },
      data: { title: "Architecture & Data Contracts", priority: "HIGH" },
    },
    {
      id: "node-2",
      type: "noteNode",
      position: { x: 480, y: 150 },
      data: { text: "Remember: Direct PUT upload to Cloudflare R2 avoids egress fees." },
    },
  ],
  edges: [
    {
      id: "edge-1",
      source: "node-1",
      target: "node-2",
    },
  ],
  viewport: { x: 0, y: 0, zoom: 1 },
};

export default function CanvasPage({ params }: { params: { projectId: string } }) {
  const [canvasData, setCanvasData] = useState<BoardCanvasData | null>(INITIAL_CANVAS_DATA);

  const handleSave = (data: BoardCanvasData) => {
    setCanvasData(data);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-48px)] overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-surface-layout shrink-0">
        <div>
          <h2 className="text-xs font-semibold text-foreground">Flowchart Canvas</h2>
          <p className="text-[11px] text-muted-foreground font-mono">
            React Flow v12 • 800 KB Payload Safeguard
          </p>
        </div>
        <div className="text-[11px] text-muted-foreground font-mono">
          Auto-saved
        </div>
      </div>

      <div className="flex-1 relative">
        <CanvasBoard initialData={canvasData} onSave={handleSave} />
      </div>
    </div>
  );
}
