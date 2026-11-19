import { BaseDocument } from "@/types/common";

export interface BoardCanvasData {
  nodes: Array<{
    id: string;
    type?: "taskNode" | "noteNode" | "decisionNode" | "groupNode" | "textNode" | string;
    position: { x: number; y: number };
    data: Record<string, unknown>;
    style?: Record<string, unknown>;
    width?: number;
    height?: number;
    zIndex?: number;
  }>;
  edges: Array<{
    id: string;
    source: string;
    target: string;
    sourceHandle?: string | null;
    targetHandle?: string | null;
    label?: string;
    type?: string;
  }>;
  viewport: { x: number; y: number; zoom: number };
}

export interface BoardDoc extends BaseDocument {
  projectId: string;
  title: string;
  description?: string;
  type: "KANBAN" | "FLOWCHART";
  canvasData: BoardCanvasData | null;
}
