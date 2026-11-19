"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  ReactFlowInstance,
  MarkerType,
  DefaultEdgeOptions,
  SelectionMode,
  ConnectionMode,
  OnConnectStart,
  OnConnectEnd,
  OnNodesChange,
  OnEdgesChange,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { TaskNode } from "./TaskNode";
import { NoteNode } from "./NoteNode";
import { DecisionNode } from "./DecisionNode";
import { GroupNode } from "./GroupNode";
import { TextNode } from "./TextNode";
import { ShapeNode, FlowchartShape } from "./ShapeNode";
import { CanvasToolbar, CanvasNodeType } from "./CanvasToolbar";
import {
  CanvasQuickConnectProvider,
  ConnectableNodeType,
  MultiSelectActionBar,
  QuickConnectMenu,
  QuickSpawnKind,
  ShapeSwitchKind,
  SHAPE_DEFAULTS,
  SourceHandleId,
  applyBulkColor,
  applyBulkShape,
  createNodeForQuickSpawn,
  getDefaultQuickSpawnKind,
  getNodeColorKey,
  getNodeShapeKind,
  getQuickSpawnDimensions,
  isColorableNodeType,
  isShapeNodeType,
  transformNodeShape,
} from "./canvas-quick-connect";
import { BoardCanvasData } from "@/features/canvas/types/boards";
import { TaskDoc } from "@/types/tasks";
import {
  exportCanvas,
  type CanvasExportFormat,
} from "@/features/canvas/utils/canvas-export";

const nodeTypes = {
  taskNode: TaskNode,
  noteNode: NoteNode,
  decisionNode: DecisionNode,
  groupNode: GroupNode,
  textNode: TextNode,
  shapeNode: ShapeNode,
};

const QUICK_SPAWN_GAP = 72;
const MAX_UNDO_STEPS = 50;

interface CanvasSnapshot {
  nodes: Node[];
  edges: Edge[];
}

function cloneSnapshot(nodes: Node[], edges: Edge[]): CanvasSnapshot {
  return {
    nodes: nodes.map((n) => ({
      ...n,
      position: { ...n.position },
      data: { ...(n.data as Record<string, unknown>) },
      ...(n.style ? { style: { ...n.style } } : {}),
      selected: false,
      dragging: false,
    })),
    edges: edges.map((e) => ({
      ...e,
      selected: false,
    })),
  };
}

const defaultEdgeOptions: DefaultEdgeOptions = {
  type: "smoothstep",
  markerEnd: {
    type: MarkerType.ArrowClosed,
    width: 16,
    height: 16,
    color: "#71717a",
  },
  style: {
    stroke: "#52525b",
    strokeWidth: 1.5,
  },
  labelStyle: {
    fill: "#e4e4e7",
    fontSize: 11,
    fontWeight: 500,
  },
  labelBgStyle: {
    fill: "#18181b",
    fillOpacity: 0.92,
  },
  labelBgPadding: [6, 3] as [number, number],
  labelBgBorderRadius: 4,
};

const MIN_ZOOM = 0.2;
const MAX_ZOOM = 2;

interface CanvasBoardProps {
  initialData: BoardCanvasData | null;
  onSave: (data: BoardCanvasData) => void;
  projectTasks?: TaskDoc[];
}

interface EdgeEditorState {
  edgeId: string;
  label: string;
  x: number;
  y: number;
}

interface QuickMenuState {
  x: number;
  y: number;
  flowPos: { x: number; y: number };
  sourceNodeId: string;
  sourceHandleId: SourceHandleId;
}

const OPPOSITE_HANDLE: Record<SourceHandleId, SourceHandleId> = {
  top: "bottom",
  right: "left",
  bottom: "top",
  left: "right",
};

function isSourceHandleId(id: string | null | undefined): id is SourceHandleId {
  return id === "top" || id === "right" || id === "bottom" || id === "left";
}

function getQuickSpawnPosition(
  sourcePos: { x: number; y: number },
  sourceW: number,
  sourceH: number,
  targetW: number,
  targetH: number,
  handleId: SourceHandleId
): { x: number; y: number } {
  switch (handleId) {
    case "right":
      return {
        x: sourcePos.x + sourceW + QUICK_SPAWN_GAP,
        y: sourcePos.y + (sourceH - targetH) / 2,
      };
    case "left":
      return {
        x: sourcePos.x - targetW - QUICK_SPAWN_GAP,
        y: sourcePos.y + (sourceH - targetH) / 2,
      };
    case "bottom":
      return {
        x: sourcePos.x + (sourceW - targetW) / 2,
        y: sourcePos.y + sourceH + QUICK_SPAWN_GAP,
      };
    case "top":
      return {
        x: sourcePos.x + (sourceW - targetW) / 2,
        y: sourcePos.y - targetH - QUICK_SPAWN_GAP,
      };
  }
}

function getDropSpawnPosition(
  flowPos: { x: number; y: number },
  targetW: number,
  targetH: number,
  targetHandle: SourceHandleId
): { x: number; y: number } {
  switch (targetHandle) {
    case "left":
      return { x: flowPos.x, y: flowPos.y - targetH / 2 };
    case "right":
      return { x: flowPos.x - targetW, y: flowPos.y - targetH / 2 };
    case "top":
      return { x: flowPos.x - targetW / 2, y: flowPos.y };
    case "bottom":
      return { x: flowPos.x - targetW / 2, y: flowPos.y - targetH };
  }
}

function getPointerClientPos(event: MouseEvent | TouchEvent): {
  clientX: number;
  clientY: number;
} {
  if ("changedTouches" in event && event.changedTouches.length > 0) {
    return {
      clientX: event.changedTouches[0].clientX,
      clientY: event.changedTouches[0].clientY,
    };
  }
  const mouse = event as MouseEvent;
  return { clientX: mouse.clientX, clientY: mouse.clientY };
}

export function CanvasBoard({
  initialData,
  onSave,
  projectTasks = [],
}: CanvasBoardProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>(
    (initialData?.nodes as Node[]) || []
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(
    (initialData?.edges as Edge[]) || []
  );
  const [edgeEditor, setEdgeEditor] = useState<EdgeEditorState | null>(null);
  const [quickMenu, setQuickMenu] = useState<QuickMenuState | null>(null);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [exporting, setExporting] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const rfInstanceRef = useRef<ReactFlowInstance | null>(null);
  const onSaveRef = useRef(onSave);
  const isFirstRenderRef = useRef(true);
  const spawnCountRef = useRef(0);
  const edgeInputRef = useRef<HTMLInputElement>(null);
  const connectStartPosRef = useRef<{ x: number; y: number } | null>(null);
  const lastConnectDragEndAtRef = useRef(0);
  const nodesRef = useRef<Node[]>(nodes);
  const edgesRef = useRef<Edge[]>(edges);
  const pastRef = useRef<CanvasSnapshot[]>([]);
  const futureRef = useRef<CanvasSnapshot[]>([]);
  const wasResizingRef = useRef(false);

  useEffect(() => {
    nodesRef.current = nodes;
  }, [nodes]);

  useEffect(() => {
    edgesRef.current = edges;
  }, [edges]);

  const syncUndoFlags = useCallback(() => {
    setCanUndo(pastRef.current.length > 0);
    setCanRedo(futureRef.current.length > 0);
  }, []);

  const pushSnapshot = useCallback(() => {
    const snap = cloneSnapshot(nodesRef.current, edgesRef.current);
    pastRef.current = [...pastRef.current.slice(-(MAX_UNDO_STEPS - 1)), snap];
    futureRef.current = [];
    syncUndoFlags();
  }, [syncUndoFlags]);

  const handleUndo = useCallback(() => {
    const prev = pastRef.current.pop();
    if (!prev) return;
    futureRef.current.push(cloneSnapshot(nodesRef.current, edgesRef.current));
    setNodes(prev.nodes);
    setEdges(prev.edges);
    setEdgeEditor(null);
    setQuickMenu(null);
    syncUndoFlags();
  }, [setNodes, setEdges, syncUndoFlags]);

  const handleRedo = useCallback(() => {
    const next = futureRef.current.pop();
    if (!next) return;
    pastRef.current.push(cloneSnapshot(nodesRef.current, edgesRef.current));
    setNodes(next.nodes);
    setEdges(next.edges);
    setEdgeEditor(null);
    setQuickMenu(null);
    syncUndoFlags();
  }, [setNodes, setEdges, syncUndoFlags]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }
      if (!(e.ctrlKey || e.metaKey)) return;
      const key = e.key.toLowerCase();
      if (key === "z" && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      } else if ((key === "z" && e.shiftKey) || key === "y") {
        e.preventDefault();
        handleRedo();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handleUndo, handleRedo]);

  useEffect(() => {
    onSaveRef.current = onSave;
  }, [onSave]);

  useEffect(() => {
    if (edgeEditor) edgeInputRef.current?.focus();
  }, [edgeEditor]);

  // Auto-save nodes & edges to Firestore (debounced in useCanvas)
  useEffect(() => {
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false;
      return;
    }

    const viewport = rfInstanceRef.current?.getViewport() || {
      x: 0,
      y: 0,
      zoom: 1,
    };

    const cleanNodes = nodes.map((n) => ({
      id: n.id,
      type: n.type,
      position: { x: Math.round(n.position.x), y: Math.round(n.position.y) },
      data: n.data as Record<string, unknown>,
      ...(n.style ? { style: n.style as Record<string, unknown> } : {}),
      ...(n.width ? { width: Math.round(n.width) } : {}),
      ...(n.height ? { height: Math.round(n.height) } : {}),
      ...(n.zIndex !== undefined ? { zIndex: n.zIndex } : {}),
    }));

    const cleanEdges = edges.map((e) => ({
      id: e.id,
      source: e.source,
      target: e.target,
      ...(e.sourceHandle ? { sourceHandle: e.sourceHandle } : {}),
      ...(e.targetHandle ? { targetHandle: e.targetHandle } : {}),
      ...(typeof e.label === "string" && e.label.length > 0
        ? { label: e.label }
        : {}),
      ...(e.type ? { type: e.type } : {}),
    }));

    onSaveRef.current({
      nodes: cleanNodes,
      edges: cleanEdges,
      viewport,
    });
  }, [nodes, edges]);

  // Smooth rAF-batched touchpad pinch zoom & 2-finger pan
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let rafId: number | null = null;
    let pendingScale = 1;
    let pendingDx = 0;
    let pendingDy = 0;
    let lastClientX = 0;
    let lastClientY = 0;

    const flush = () => {
      rafId = null;
      const rf = rfInstanceRef.current;
      if (!rf) return;

      const { x, y, zoom } = rf.getViewport();
      let nextX = x - pendingDx;
      let nextY = y - pendingDy;
      let nextZoom = zoom;

      pendingDx = 0;
      pendingDy = 0;

      if (pendingScale !== 1) {
        nextZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoom * pendingScale));
        pendingScale = 1;

        if (nextZoom !== zoom) {
          const rect = el.getBoundingClientRect();
          const px = lastClientX - rect.left;
          const py = lastClientY - rect.top;
          const ratio = nextZoom / zoom;
          nextX = px - (px - nextX) * ratio;
          nextY = py - (py - nextY) * ratio;
        }
      }

      if (nextX !== x || nextY !== y || nextZoom !== zoom) {
        rf.setViewport({ x: nextX, y: nextY, zoom: nextZoom });
      }
    };

    const handleWheel = (e: WheelEvent) => {
      if ((e.target as HTMLElement | null)?.closest(".nowheel")) return;

      e.preventDefault();
      e.stopPropagation();

      const mult = e.deltaMode === 1 ? 16 : 1;

      if (e.ctrlKey || e.metaKey) {
        const clamped = Math.max(-20, Math.min(20, e.deltaY * mult));
        pendingScale *= Math.exp(-clamped * 0.012);
        lastClientX = e.clientX;
        lastClientY = e.clientY;
      } else {
        const dx =
          e.shiftKey && e.deltaX === 0 ? e.deltaY * mult : e.deltaX * mult;
        const dy = e.shiftKey && e.deltaX === 0 ? 0 : e.deltaY * mult;
        pendingDx += dx;
        pendingDy += dy;
      }

      if (rafId === null) {
        rafId = requestAnimationFrame(flush);
      }
    };

    el.addEventListener("wheel", handleWheel, { passive: false, capture: true });
    return () => {
      el.removeEventListener("wheel", handleWheel, { capture: true });
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, []);

  const getSpawnPosition = useCallback(() => {
    const offset = (spawnCountRef.current % 6) * 24;
    spawnCountRef.current += 1;

    const rf = rfInstanceRef.current;
    const el = containerRef.current;
    if (rf && el) {
      const rect = el.getBoundingClientRect();
      const center = rf.screenToFlowPosition({
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      });
      return { x: center.x - 80 + offset, y: center.y - 40 + offset };
    }
    return { x: 250 + offset, y: 150 + offset };
  }, []);

  const handleNodesChange: OnNodesChange = useCallback(
    (changes) => {
      const hasMutation = changes.some(
        (c) => c.type === "remove" || c.type === "replace"
      );
      const isResizingNow = changes.some(
        (c) => c.type === "dimensions" && c.resizing === true
      );
      const resizeEnded = changes.some(
        (c) => c.type === "dimensions" && c.resizing === false
      );

      if (hasMutation || (isResizingNow && !wasResizingRef.current)) {
        pushSnapshot();
      }
      if (isResizingNow) wasResizingRef.current = true;
      if (resizeEnded) wasResizingRef.current = false;

      onNodesChange(changes);
    },
    [onNodesChange, pushSnapshot]
  );

  const handleEdgesChange: OnEdgesChange = useCallback(
    (changes) => {
      if (changes.some((c) => c.type === "remove" || c.type === "replace")) {
        pushSnapshot();
      }
      onEdgesChange(changes);
    },
    [onEdgesChange, pushSnapshot]
  );

  const handleNodeDragStart = useCallback(() => {
    pushSnapshot();
  }, [pushSnapshot]);

  const onConnect = useCallback(
    (params: Connection) => {
      pushSnapshot();
      setEdges((eds) => addEdge(params, eds));
    },
    [pushSnapshot, setEdges]
  );

  const handleAddNode = useCallback(
    (type: CanvasNodeType) => {
      pushSnapshot();
      const position = getSpawnPosition();
      const id = `node-${Date.now()}`;

      let newNode: Node;
      switch (type) {
        case "taskNode":
          newNode = {
            id,
            type,
            position,
            data: { title: "New Task", priority: "MEDIUM" },
          };
          break;
        case "noteNode":
          newNode = {
            id,
            type,
            position,
            data: { text: "Double-click to edit", color: "amber" },
          };
          break;
        case "decisionNode":
          newNode = {
            id,
            type,
            position,
            data: { label: "Condition?" },
          };
          break;
        case "groupNode":
          newNode = {
            id,
            type,
            position,
            zIndex: -1,
            style: { width: 320, height: 220 },
            data: { label: "Section", color: "zinc" },
          };
          break;
        case "textNode":
          newNode = {
            id,
            type,
            position,
            data: { text: "Heading", size: "md" },
          };
          break;
      }

      setNodes((nds) => [...nds, newNode]);
    },
    [getSpawnPosition, pushSnapshot, setNodes]
  );

  const handleAddShape = useCallback(
    (shape: FlowchartShape) => {
      pushSnapshot();
      const position = getSpawnPosition();
      const preset = SHAPE_DEFAULTS[shape];
      const newNode: Node = {
        id: `node-${Date.now()}`,
        type: "shapeNode",
        position,
        style: { width: preset.width, height: preset.height },
        data: {
          shape,
          label: preset.label,
          color: preset.color,
        },
      };
      setNodes((nds) => [...nds, newNode]);
    },
    [getSpawnPosition, pushSnapshot, setNodes]
  );

  const handleLinkTask = useCallback(
    (task: TaskDoc) => {
      pushSnapshot();
      const position = getSpawnPosition();
      const newNode: Node = {
        id: `node-${Date.now()}`,
        type: "taskNode",
        position,
        data: {
          taskId: task.id,
          title: task.title,
          priority: task.priority,
          status: task.columnId,
        },
      };
      setNodes((nds) => [...nds, newNode]);
    },
    [getSpawnPosition, pushSnapshot, setNodes]
  );

  const handleEdgeDoubleClick = useCallback(
    (event: React.MouseEvent, edge: Edge) => {
      event.stopPropagation();
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      setEdgeEditor({
        edgeId: edge.id,
        label: typeof edge.label === "string" ? edge.label : "",
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      });
    },
    []
  );

  const commitEdgeLabel = useCallback(() => {
    if (!edgeEditor) return;
    const trimmed = edgeEditor.label.trim();
    pushSnapshot();
    setEdges((eds) =>
      eds.map((e) =>
        e.id === edgeEditor.edgeId
          ? { ...e, label: trimmed || undefined }
          : e
      )
    );
    setEdgeEditor(null);
  }, [edgeEditor, pushSnapshot, setEdges]);

  const quickSpawnFromHandle = useCallback(
    (
      sourceNodeId: string,
      handleId: SourceHandleId,
      explicitKind?: QuickSpawnKind
    ) => {
      const rf = rfInstanceRef.current;
      if (!rf) return;
      const sourceNode = rf.getNode(sourceNodeId);
      if (!sourceNode) return;

      const nodeType = (sourceNode.type || "shapeNode") as ConnectableNodeType;
      const kind = explicitKind ?? getDefaultQuickSpawnKind(nodeType);
      const targetDims = getQuickSpawnDimensions(kind);

      const sourceW =
        sourceNode.measured?.width ??
        (typeof sourceNode.style?.width === "number"
          ? sourceNode.style.width
          : sourceNode.width ?? 160);
      const sourceH =
        sourceNode.measured?.height ??
        (typeof sourceNode.style?.height === "number"
          ? sourceNode.style.height
          : sourceNode.height ?? 60);

      const position = getQuickSpawnPosition(
        sourceNode.position,
        sourceW,
        sourceH,
        targetDims.width,
        targetDims.height,
        handleId
      );

      // Avoid stacking directly on top of an existing branch when spawning repeatedly from the same dot
      const existingNodes = rf.getNodes();
      const isOccupied = (x: number, y: number) =>
        existingNodes.some(
          (n) =>
            Math.abs(n.position.x - x) < 24 && Math.abs(n.position.y - y) < 24
        );
      let attempts = 0;
      while (isOccupied(position.x, position.y) && attempts < 10) {
        if (handleId === "right" || handleId === "left") {
          position.y += targetDims.height + 24;
        } else {
          position.x += targetDims.width + 24;
        }
        attempts += 1;
      }

      const newNode: Node = {
        ...createNodeForQuickSpawn(kind, position),
        selected: true,
      };
      const targetHandle = OPPOSITE_HANDLE[handleId];

      pushSnapshot();
      setNodes((nds) => [
        ...nds.map((n) => (n.selected ? { ...n, selected: false } : n)),
        newNode,
      ]);
      setEdges((eds) =>
        addEdge(
          {
            source: sourceNodeId,
            sourceHandle: handleId,
            target: newNode.id,
            targetHandle,
          },
          eds
        )
      );
    },
    [pushSnapshot, setNodes, setEdges]
  );

  const handleConnectStart: OnConnectStart = useCallback((event) => {
    const { clientX, clientY } = getPointerClientPos(event);
    connectStartPosRef.current = { x: clientX, y: clientY };
    setQuickMenu(null);
  }, []);

  const handleConnectEnd: OnConnectEnd = useCallback(
    (event, connectionState) => {
      lastConnectDragEndAtRef.current = Date.now();
      const startPos = connectStartPosRef.current;
      connectStartPosRef.current = null;

      if (connectionState.isValid) return;
      const fromNode = connectionState.fromNode;
      const fromHandle = connectionState.fromHandle;
      if (!fromNode || !fromHandle || fromHandle.type !== "source") return;

      const handleId: SourceHandleId = isSourceHandleId(fromHandle.id)
        ? fromHandle.id
        : "right";
      const { clientX, clientY } = getPointerClientPos(event);

      if (startPos) {
        const dist = Math.hypot(clientX - startPos.x, clientY - startPos.y);
        if (dist < 10) {
          quickSpawnFromHandle(fromNode.id, handleId);
          return;
        }
      }

      const rf = rfInstanceRef.current;
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rf || !rect) return;

      const MENU_W = 248;
      const MENU_H = 216;
      const rawX = clientX - rect.left;
      const rawY = clientY - rect.top;
      const clampedX = Math.max(8, Math.min(rawX, rect.width - MENU_W - 8));
      const clampedY = Math.max(8, Math.min(rawY, rect.height - MENU_H - 8));

      setQuickMenu({
        x: clampedX,
        y: clampedY,
        flowPos: rf.screenToFlowPosition({ x: clientX, y: clientY }),
        sourceNodeId: fromNode.id,
        sourceHandleId: handleId,
      });
    },
    [quickSpawnFromHandle]
  );

  const handleQuickMenuSelect = useCallback(
    (kind: QuickSpawnKind) => {
      if (!quickMenu) return;
      const dims = getQuickSpawnDimensions(kind);
      const targetHandle = OPPOSITE_HANDLE[quickMenu.sourceHandleId];
      const position = getDropSpawnPosition(
        quickMenu.flowPos,
        dims.width,
        dims.height,
        targetHandle
      );

      const newNode: Node = {
        ...createNodeForQuickSpawn(kind, position),
        selected: true,
      };

      pushSnapshot();
      setNodes((nds) => [
        ...nds.map((n) => (n.selected ? { ...n, selected: false } : n)),
        newNode,
      ]);
      setEdges((eds) =>
        addEdge(
          {
            source: quickMenu.sourceNodeId,
            sourceHandle: quickMenu.sourceHandleId,
            target: newNode.id,
            targetHandle,
          },
          eds
        )
      );
      setQuickMenu(null);
    },
    [quickMenu, pushSnapshot, setNodes, setEdges]
  );

  const selectionMeta = useMemo(() => {
    const selected = nodes.filter((n) => n.selected);
    const shapeNodes = selected.filter((n) => isShapeNodeType(n.type));
    const colorableNodes = selected.filter((n) => isColorableNodeType(n.type));

    let commonShape: ShapeSwitchKind | null = null;
    if (shapeNodes.length > 0) {
      const firstShape = getNodeShapeKind(shapeNodes[0]);
      if (
        firstShape &&
        shapeNodes.every((n) => getNodeShapeKind(n) === firstShape)
      ) {
        commonShape = firstShape;
      }
    }

    let commonColor: string | null = null;
    if (colorableNodes.length > 0) {
      const firstColor = getNodeColorKey(colorableNodes[0]);
      if (
        firstColor &&
        colorableNodes.every((n) => getNodeColorKey(n) === firstColor)
      ) {
        commonColor = firstColor;
      }
    }

    return {
      selectedCount: selected.length,
      selectedShapeCount: shapeNodes.length,
      selectedColorableCount: colorableNodes.length,
      commonShape,
      commonColor,
    };
  }, [nodes]);

  const { selectedCount } = selectionMeta;

  const handleExport = useCallback(
    async (format: CanvasExportFormat) => {
      const container = containerRef.current;
      if (!container || exporting) return;
      setExporting(true);
      try {
        await exportCanvas({
          container,
          nodes: nodesRef.current,
          edges: edgesRef.current,
          format,
        });
      } catch (err) {
        console.error("Canvas export failed:", err);
      } finally {
        setExporting(false);
      }
    },
    [exporting]
  );

  const isMultiSelected = selectedCount > 1;

  const changeNodeShape = useCallback(
    (nodeId: string, target: ShapeSwitchKind) => {
      pushSnapshot();
      setNodes((nds) =>
        nds.map((n) => (n.id === nodeId ? transformNodeShape(n, target) : n))
      );
    },
    [pushSnapshot, setNodes]
  );

  const handleBulkShapeChange = useCallback(
    (target: ShapeSwitchKind) => {
      if (selectionMeta.selectedShapeCount === 0) return;
      pushSnapshot();
      setNodes((nds) => applyBulkShape(nds, target));
    },
    [selectionMeta.selectedShapeCount, pushSnapshot, setNodes]
  );

  const handleBulkColorChange = useCallback(
    (color: string) => {
      if (selectionMeta.selectedColorableCount === 0) return;
      pushSnapshot();
      setNodes((nds) => applyBulkColor(nds, color));
    },
    [selectionMeta.selectedColorableCount, pushSnapshot, setNodes]
  );

  const quickConnectValue = useMemo(
    () => ({
      quickSpawnFromHandle,
      wasRecentConnectDrag: () =>
        Date.now() - lastConnectDragEndAtRef.current < 250,
      isMultiSelected,
      changeNodeShape,
    }),
    [quickSpawnFromHandle, isMultiSelected, changeNodeShape]
  );

  return (
    <div ref={containerRef} className="relative w-full h-full bg-surface-base">
      <CanvasToolbar
        onAddNode={handleAddNode}
        onAddShape={handleAddShape}
        onLinkTask={handleLinkTask}
        projectTasks={projectTasks}
        onUndo={handleUndo}
        onRedo={handleRedo}
        canUndo={canUndo}
        canRedo={canRedo}
        onExport={handleExport}
        selectedCount={selectedCount}
        totalNodesCount={nodes.length}
        exporting={exporting}
      />

      {edgeEditor && (
        <div
          style={{ left: edgeEditor.x, top: edgeEditor.y }}
          className="nowheel absolute z-30 -translate-x-1/2 -translate-y-1/2 bg-zinc-900 border border-zinc-600 rounded-md p-1.5 flex items-center gap-1"
        >
          <input
            ref={edgeInputRef}
            value={edgeEditor.label}
            onChange={(e) =>
              setEdgeEditor((prev) =>
                prev ? { ...prev, label: e.target.value } : null
              )
            }
            onBlur={commitEdgeLabel}
            onKeyDown={(e) => {
              if (e.key === "Enter") commitEdgeLabel();
              if (e.key === "Escape") setEdgeEditor(null);
            }}
            placeholder="Edge label..."
            className="w-32 bg-zinc-950 text-xs text-zinc-100 px-2 py-1 rounded border border-zinc-700 outline-none focus:border-zinc-400"
          />
        </div>
      )}

      {quickMenu && (
        <QuickConnectMenu
          x={quickMenu.x}
          y={quickMenu.y}
          onSelect={handleQuickMenuSelect}
          onClose={() => setQuickMenu(null)}
        />
      )}

      <MultiSelectActionBar
        selectedCount={selectionMeta.selectedCount}
        selectedShapeCount={selectionMeta.selectedShapeCount}
        selectedColorableCount={selectionMeta.selectedColorableCount}
        commonShape={selectionMeta.commonShape}
        commonColor={selectionMeta.commonColor}
        onChangeShape={handleBulkShapeChange}
        onChangeColor={handleBulkColorChange}
      />

      <CanvasQuickConnectProvider value={quickConnectValue}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          defaultEdgeOptions={defaultEdgeOptions}
          onInit={(instance) => {
            rfInstanceRef.current = instance;
          }}
          onNodesChange={handleNodesChange}
          onEdgesChange={handleEdgesChange}
          onNodeDragStart={handleNodeDragStart}
          onConnect={onConnect}
          onConnectStart={handleConnectStart}
          onConnectEnd={handleConnectEnd}
          onEdgeDoubleClick={handleEdgeDoubleClick}
          connectionMode={ConnectionMode.Loose}
          selectionOnDrag
          selectionMode={SelectionMode.Partial}
          panOnDrag={[1, 2]}
          zoomOnScroll={false}
          zoomOnPinch={false}
          minZoom={MIN_ZOOM}
          maxZoom={MAX_ZOOM}
          colorMode="dark"
          fitView
        >
          <Background color="#27272a" gap={24} size={1} />
          <Controls />
        </ReactFlow>
      </CanvasQuickConnectProvider>
    </div>
  );
}
