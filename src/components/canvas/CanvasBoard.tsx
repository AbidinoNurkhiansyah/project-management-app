"use client";

import React, { useCallback, useMemo } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { TaskNode } from "./TaskNode";
import { NoteNode } from "./NoteNode";
import { CanvasToolbar } from "./CanvasToolbar";
import { BoardCanvasData } from "@/types/boards";

interface CanvasBoardProps {
  initialData: BoardCanvasData | null;
  onSave: (data: BoardCanvasData) => void;
}

export function CanvasBoard({ initialData, onSave }: CanvasBoardProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>(
    (initialData?.nodes as Node[]) || []
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(
    (initialData?.edges as Edge[]) || []
  );

  const nodeTypes = useMemo(
    () => ({ taskNode: TaskNode, noteNode: NoteNode }),
    []
  );

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const handleAddNode = (type: "taskNode" | "noteNode") => {
    const newNode: Node = {
      id: `node-${Date.now()}`,
      type,
      position: { x: 250, y: 150 },
      data:
        type === "taskNode" ? { title: "New Task" } : { text: "Sticky note" },
    };
    setNodes((nds) => [...nds, newNode]);
  };

  return (
    <div className="relative w-full h-[calc(100vh-100px)] bg-surface-base">
      <CanvasToolbar onAddNode={handleAddNode} />
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
      >
        <Background color="#27272a" gap={16} />
        <Controls className="!bg-surface-elevated !border-border" />
      </ReactFlow>
    </div>
  );
}
