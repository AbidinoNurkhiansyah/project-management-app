import { BaseDocument } from "./common";

export interface BoardCanvasData {
  nodes: Array<{
    id: string;
    type?: "taskNode" | "noteNode" | string;
    position: { x: number; y: number };
    data: Record<string, unknown>;
  }>;
  edges: Array<{
    id: string;
    source: string;
    target: string;
    label?: string;
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
