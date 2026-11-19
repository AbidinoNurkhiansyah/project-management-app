"use client";

import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
} from "react";
import { Handle, Position, Node, useConnection } from "@xyflow/react";
import { CheckSquare, StickyNote, Plus } from "lucide-react";
import type { FlowchartShape } from "./ShapeNode";

export type ShapeSwitchKind = FlowchartShape | "decision";

export type QuickSpawnKind = ShapeSwitchKind | "taskNode" | "noteNode";

export type SourceHandleId = "top" | "right" | "bottom" | "left";
export type ConnectableNodeType =
  | "shapeNode"
  | "decisionNode"
  | "taskNode"
  | "noteNode";

export const SHAPE_COLORS: Record<
  string,
  { fill: string; stroke: string; selectedStroke: string; dot: string }
> = {
  zinc: {
    fill: "#18181b",
    stroke: "#52525b",
    selectedStroke: "#e4e4e7",
    dot: "bg-zinc-400",
  },
  blue: {
    fill: "#0f1d36",
    stroke: "#3b82f6",
    selectedStroke: "#93c5fd",
    dot: "bg-blue-400",
  },
  emerald: {
    fill: "#0b261e",
    stroke: "#10b981",
    selectedStroke: "#6ee7b7",
    dot: "bg-emerald-400",
  },
  amber: {
    fill: "#2a1d0b",
    stroke: "#f59e0b",
    selectedStroke: "#fcd34d",
    dot: "bg-amber-400",
  },
  violet: {
    fill: "#1e1233",
    stroke: "#8b5cf6",
    selectedStroke: "#c4b5fd",
    dot: "bg-violet-400",
  },
  rose: {
    fill: "#2b0f18",
    stroke: "#f43f5e",
    selectedStroke: "#fda4af",
    dot: "bg-rose-400",
  },
};

export const SHAPE_DEFAULTS: Record<
  FlowchartShape,
  { label: string; width: number; height: number; color: string }
> = {
  terminator: { label: "Start", width: 150, height: 50, color: "emerald" },
  process: { label: "Process", width: 160, height: 60, color: "blue" },
  io: { label: "Input / Output", width: 164, height: 60, color: "amber" },
  database: { label: "Database", width: 120, height: 84, color: "violet" },
  document: { label: "Document", width: 156, height: 72, color: "zinc" },
  subprocess: { label: "Subprocess", width: 164, height: 60, color: "blue" },
  connector: { label: "A", width: 64, height: 64, color: "zinc" },
};

export interface QuickSpawnItem {
  kind: QuickSpawnKind;
  label: string;
  hint: string;
  icon: React.ReactNode;
}

export const QUICK_SPAWN_ITEMS: QuickSpawnItem[] = [
  {
    kind: "process",
    label: "Process",
    hint: "Step",
    icon: (
      <svg viewBox="0 0 24 14" className="w-4 h-3 shrink-0">
        <rect
          x="1"
          y="1"
          width="22"
          height="12"
          rx="1.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
        />
      </svg>
    ),
  },
  {
    kind: "decision",
    label: "Decision",
    hint: "Branch",
    icon: (
      <svg viewBox="0 0 24 16" className="w-4 h-3 shrink-0">
        <polygon
          points="12,1 23,8 12,15 1,8"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
        />
      </svg>
    ),
  },
  {
    kind: "terminator",
    label: "Start / End",
    hint: "Terminator",
    icon: (
      <svg viewBox="0 0 24 14" className="w-4 h-3 shrink-0">
        <rect
          x="1"
          y="1"
          width="22"
          height="12"
          rx="6"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
        />
      </svg>
    ),
  },
  {
    kind: "io",
    label: "Input / Out",
    hint: "Data",
    icon: (
      <svg viewBox="0 0 24 14" className="w-4 h-3 shrink-0">
        <polygon
          points="5,1 23,1 19,13 1,13"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
        />
      </svg>
    ),
  },
  {
    kind: "database",
    label: "Database",
    hint: "Storage",
    icon: (
      <svg viewBox="0 0 20 18" className="w-4 h-3 shrink-0">
        <ellipse
          cx="10"
          cy="4"
          rx="8"
          ry="2.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <path
          d="M2,4 L2,14 C2,15.5 5.5,16.5 10,16.5 C14.5,16.5 18,15.5 18,14 L18,4"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        />
      </svg>
    ),
  },
  {
    kind: "document",
    label: "Document",
    hint: "File",
    icon: (
      <svg viewBox="0 0 24 16" className="w-4 h-3 shrink-0">
        <path
          d="M1,1 L23,1 L23,12 C18,9 14,15 8,14 C4,13 2,14 1,13 Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        />
      </svg>
    ),
  },
  {
    kind: "subprocess",
    label: "Subprocess",
    hint: "Sub",
    icon: (
      <svg viewBox="0 0 24 14" className="w-4 h-3 shrink-0">
        <rect
          x="1"
          y="1"
          width="22"
          height="12"
          rx="1"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <line
          x1="5"
          y1="1"
          x2="5"
          y2="13"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <line
          x1="19"
          y1="1"
          x2="19"
          y2="13"
          stroke="currentColor"
          strokeWidth="1.5"
        />
      </svg>
    ),
  },
  {
    kind: "connector",
    label: "Connector",
    hint: "Circle",
    icon: (
      <svg viewBox="0 0 16 16" className="w-4 h-3 shrink-0">
        <circle
          cx="8"
          cy="8"
          r="6"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
        />
      </svg>
    ),
  },
  {
    kind: "taskNode",
    label: "Task",
    hint: "Card",
    icon: <CheckSquare className="w-3.5 h-3.5 text-blue-400 shrink-0" />,
  },
  {
    kind: "noteNode",
    label: "Note",
    hint: "Sticky",
    icon: <StickyNote className="w-3.5 h-3.5 text-amber-400 shrink-0" />,
  },
];

export function getDefaultQuickSpawnKind(
  nodeType: ConnectableNodeType
): QuickSpawnKind {
  switch (nodeType) {
    case "taskNode":
      return "taskNode";
    case "noteNode":
      return "noteNode";
    case "decisionNode":
    case "shapeNode":
    default:
      return "process";
  }
}

export function getQuickSpawnDimensions(kind: QuickSpawnKind): {
  width: number;
  height: number;
  label: string;
} {
  if (kind === "decision") {
    return { width: 140, height: 96, label: "Decision" };
  }
  if (kind === "taskNode") {
    return { width: 190, height: 84, label: "Task" };
  }
  if (kind === "noteNode") {
    return { width: 170, height: 80, label: "Note" };
  }
  const preset = SHAPE_DEFAULTS[kind];
  return { width: preset.width, height: preset.height, label: preset.label };
}

export function createNodeForQuickSpawn(
  kind: QuickSpawnKind,
  position: { x: number; y: number }
): Node {
  const id = `node-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

  if (kind === "decision") {
    return {
      id,
      type: "decisionNode",
      position,
      data: { label: "Condition?" },
    };
  }
  if (kind === "taskNode") {
    return {
      id,
      type: "taskNode",
      position,
      data: { title: "New Task", priority: "MEDIUM" },
    };
  }
  if (kind === "noteNode") {
    return {
      id,
      type: "noteNode",
      position,
      data: { text: "Double-click to edit", color: "amber" },
    };
  }

  const preset = SHAPE_DEFAULTS[kind];
  return {
    id,
    type: "shapeNode",
    position,
    style: { width: preset.width, height: preset.height },
    data: {
      shape: kind,
      label: preset.label,
      color: preset.color,
    },
  };
}

interface CanvasQuickConnectContextValue {
  quickSpawnFromHandle: (
    sourceNodeId: string,
    handleId: SourceHandleId,
    kind?: QuickSpawnKind
  ) => void;
  wasRecentConnectDrag: () => boolean;
  isMultiSelected?: boolean;
  changeNodeShape?: (nodeId: string, target: ShapeSwitchKind) => void;
}

const CanvasQuickConnectContext =
  createContext<CanvasQuickConnectContextValue | null>(null);

export const CanvasQuickConnectProvider = CanvasQuickConnectContext.Provider;

export function useCanvasQuickConnect() {
  return useContext(CanvasQuickConnectContext);
}

export const SHAPE_SWITCH_ITEMS = QUICK_SPAWN_ITEMS.filter(
  (item): item is QuickSpawnItem & { kind: ShapeSwitchKind } =>
    item.kind !== "taskNode" && item.kind !== "noteNode"
);

export function isShapeNodeType(type: string | undefined): boolean {
  return type === "shapeNode" || type === "decisionNode";
}

export function isColorableNodeType(type: string | undefined): boolean {
  return (
    type === "shapeNode" ||
    type === "decisionNode" ||
    type === "noteNode" ||
    type === "groupNode"
  );
}

export function getNodeShapeKind(node: Node): ShapeSwitchKind | null {
  if (node.type === "decisionNode") return "decision";
  if (node.type === "shapeNode") {
    const shape = (node.data as Record<string, unknown> | undefined)?.shape;
    return typeof shape === "string" ? (shape as FlowchartShape) : "process";
  }
  return null;
}

export function getNodeColorKey(node: Node): string | null {
  if (!isColorableNodeType(node.type)) return null;
  const color = (node.data as Record<string, unknown> | undefined)?.color;
  if (typeof color === "string") return color;
  if (node.type === "decisionNode") return "violet";
  return "zinc";
}

export function transformNodeShape(node: Node, target: ShapeSwitchKind): Node {
  if (!isShapeNodeType(node.type)) return node;

  const prevData = (node.data || {}) as Record<string, unknown>;
  const prevLabel =
    typeof prevData.label === "string" && prevData.label.trim()
      ? prevData.label
      : target === "decision"
      ? "Condition?"
      : SHAPE_DEFAULTS[target].label;

  if (target === "decision") {
    const prevColor =
      typeof prevData.color === "string" ? prevData.color : "violet";
    return {
      ...node,
      type: "decisionNode",
      style: undefined,
      width: undefined,
      height: undefined,
      data: { label: prevLabel, color: prevColor },
    };
  }

  const preset = SHAPE_DEFAULTS[target];
  const prevShape = prevData.shape as FlowchartShape | undefined;
  const prevColor =
    typeof prevData.color === "string" ? prevData.color : preset.color;
  const needsDefaultSize =
    node.type !== "shapeNode" ||
    target === "connector" ||
    prevShape === "connector";

  return {
    ...node,
    type: "shapeNode",
    style: needsDefaultSize
      ? { width: preset.width, height: preset.height }
      : node.style || { width: preset.width, height: preset.height },
    data: {
      shape: target,
      label: prevLabel,
      color: prevColor,
    },
  };
}

export function applyBulkShape(
  nodes: Node[],
  target: ShapeSwitchKind
): Node[] {
  return nodes.map((n) =>
    n.selected && isShapeNodeType(n.type) ? transformNodeShape(n, target) : n
  );
}

export function applyBulkColor(nodes: Node[], color: string): Node[] {
  return nodes.map((n) =>
    n.selected && isColorableNodeType(n.type)
      ? {
          ...n,
          data: {
            ...(n.data as Record<string, unknown>),
            color,
          },
        }
      : n
  );
}

interface ShapeQuickSwitcherProps {
  nodeId: string;
  currentShape: ShapeSwitchKind;
}

export const ShapeQuickSwitcher = React.memo(function ShapeQuickSwitcher({
  nodeId,
  currentShape,
}: ShapeQuickSwitcherProps) {
  const quickConnect = useCanvasQuickConnect();
  if (!quickConnect?.changeNodeShape) return null;

  return (
    <div className="flex items-center gap-0.5">
      {SHAPE_SWITCH_ITEMS.map((item) => {
        const active = item.kind === currentShape;
        return (
          <button
            key={item.kind}
            type="button"
            title={item.label}
            aria-label={`Change shape to ${item.label}`}
            onClick={(e) => {
              e.stopPropagation();
              if (!active) {
                quickConnect.changeNodeShape?.(nodeId, item.kind);
              }
            }}
            className={`p-1 rounded transition-colors ${
              active
                ? "bg-zinc-700 text-white"
                : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
            }`}
          >
            {item.icon}
          </button>
        );
      })}
    </div>
  );
});

interface NodeQuickHandlesProps {
  nodeId: string;
  nodeType: ConnectableNodeType;
  handleClassName?: string;
}

const GHOST_PREVIEW_ACCENT: Record<
  QuickSpawnKind,
  { border: string; bg: string; text: string }
> = {
  process: {
    border: "border-blue-400/70",
    bg: "bg-blue-950/50",
    text: "text-blue-200",
  },
  decision: {
    border: "border-violet-400/70",
    bg: "bg-violet-950/50",
    text: "text-violet-200",
  },
  terminator: {
    border: "border-emerald-400/70",
    bg: "bg-emerald-950/50",
    text: "text-emerald-200",
  },
  io: {
    border: "border-amber-400/70",
    bg: "bg-amber-950/50",
    text: "text-amber-200",
  },
  database: {
    border: "border-violet-400/70",
    bg: "bg-violet-950/50",
    text: "text-violet-200",
  },
  document: {
    border: "border-zinc-400/70",
    bg: "bg-zinc-900/60",
    text: "text-zinc-200",
  },
  subprocess: {
    border: "border-blue-400/70",
    bg: "bg-blue-950/50",
    text: "text-blue-200",
  },
  connector: {
    border: "border-zinc-400/70",
    bg: "bg-zinc-900/60",
    text: "text-zinc-200",
  },
  taskNode: {
    border: "border-blue-400/70",
    bg: "bg-zinc-900/70",
    text: "text-blue-200",
  },
  noteNode: {
    border: "border-amber-400/70",
    bg: "bg-amber-950/50",
    text: "text-amber-200",
  },
};

export const NodeQuickHandles = React.memo(function NodeQuickHandles({
  nodeId,
  nodeType,
  handleClassName = "!w-2 !h-2 !bg-zinc-400",
}: NodeQuickHandlesProps) {
  const quickConnect = useCanvasQuickConnect();
  const connectionInProgress = useConnection((c) => c.inProgress);
  const [hoveredHandle, setHoveredHandle] = useState<SourceHandleId | null>(
    null
  );

  const defaultKind = getDefaultQuickSpawnKind(nodeType);
  const defaultMeta = getQuickSpawnDimensions(defaultKind);
  const accent = GHOST_PREVIEW_ACCENT[defaultKind];

  useEffect(() => {
    if (connectionInProgress) {
      setHoveredHandle(null);
    }
  }, [connectionInProgress]);

  const openHover = (side: SourceHandleId) => {
    if (!connectionInProgress) {
      setHoveredHandle(side);
    }
  };

  const closeHover = () => {
    setHoveredHandle(null);
  };

  const handleDotClick = (e: React.MouseEvent, side: SourceHandleId) => {
    e.stopPropagation();
    if (!quickConnect || quickConnect.wasRecentConnectDrag()) return;
    setHoveredHandle(null);
    quickConnect.quickSpawnFromHandle(nodeId, side, defaultKind);
  };

  const sourceHandleClasses = `${handleClassName} after:content-[''] after:absolute after:-inset-2 after:rounded-full hover:!scale-125 hover:!bg-blue-400 transition-transform cursor-crosshair`;

  const renderGhostPreview = () => (
    <div
      className={`pointer-events-none flex flex-col items-center justify-center w-[124px] h-[48px] rounded border border-dashed backdrop-blur-[1px] opacity-80 ${accent.border} ${accent.bg}`}
    >
      <span
        className={`flex items-center gap-1 text-[11px] font-medium ${accent.text}`}
      >
        <Plus className="w-3 h-3" />
        {defaultMeta.label}
      </span>
      <span className="text-[9px] text-zinc-400 leading-none mt-0.5">
        Click dot or drag
      </span>
    </div>
  );

  return (
    <>
      <Handle
        id="top"
        type="source"
        position={Position.Top}
        className={sourceHandleClasses}
        onMouseEnter={() => openHover("top")}
        onMouseLeave={closeHover}
        onClick={(e) => handleDotClick(e, "top")}
      />
      <Handle
        id="left"
        type="source"
        position={Position.Left}
        className={sourceHandleClasses}
        onMouseEnter={() => openHover("left")}
        onMouseLeave={closeHover}
        onClick={(e) => handleDotClick(e, "left")}
      />
      <Handle
        id="right"
        type="source"
        position={Position.Right}
        className={sourceHandleClasses}
        onMouseEnter={() => openHover("right")}
        onMouseLeave={closeHover}
        onClick={(e) => handleDotClick(e, "right")}
      />
      <Handle
        id="bottom"
        type="source"
        position={Position.Bottom}
        className={sourceHandleClasses}
        onMouseEnter={() => openHover("bottom")}
        onMouseLeave={closeHover}
        onClick={(e) => handleDotClick(e, "bottom")}
      />

      {hoveredHandle === "top" && !connectionInProgress && (
        <div className="nodrag nopan absolute bottom-full left-1/2 -translate-x-1/2 flex flex-col items-center pb-1 z-30 pointer-events-none">
          {renderGhostPreview()}
          <svg
            width="16"
            height="46"
            viewBox="0 0 16 46"
            className="shrink-0 text-blue-400/75"
          >
            <polygon points="4,8 8,0 12,8" fill="currentColor" />
            <line
              x1="8"
              y1="8"
              x2="8"
              y2="46"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeDasharray="4 3"
            />
          </svg>
        </div>
      )}

      {hoveredHandle === "left" && !connectionInProgress && (
        <div className="nodrag nopan absolute right-full top-1/2 -translate-y-1/2 flex items-center pr-1 z-30 pointer-events-none">
          {renderGhostPreview()}
          <svg
            width="52"
            height="16"
            viewBox="0 0 52 16"
            className="shrink-0 text-blue-400/75"
          >
            <polygon points="8,4 0,8 8,12" fill="currentColor" />
            <line
              x1="8"
              y1="8"
              x2="52"
              y2="8"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeDasharray="4 3"
            />
          </svg>
        </div>
      )}

      {hoveredHandle === "right" && !connectionInProgress && (
        <div className="nodrag nopan absolute left-full top-1/2 -translate-y-1/2 flex items-center pl-1 z-30 pointer-events-none">
          <svg
            width="52"
            height="16"
            viewBox="0 0 52 16"
            className="shrink-0 text-blue-400/75"
          >
            <line
              x1="0"
              y1="8"
              x2="44"
              y2="8"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeDasharray="4 3"
            />
            <polygon points="44,4 52,8 44,12" fill="currentColor" />
          </svg>
          {renderGhostPreview()}
        </div>
      )}

      {hoveredHandle === "bottom" && !connectionInProgress && (
        <div className="nodrag nopan absolute top-full left-1/2 -translate-x-1/2 flex flex-col items-center pt-1 z-30 pointer-events-none">
          <svg
            width="16"
            height="46"
            viewBox="0 0 16 46"
            className="shrink-0 text-blue-400/75"
          >
            <line
              x1="8"
              y1="0"
              x2="8"
              y2="38"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeDasharray="4 3"
            />
            <polygon points="4,38 8,46 12,38" fill="currentColor" />
          </svg>
          {renderGhostPreview()}
        </div>
      )}
    </>
  );
});

interface QuickConnectMenuProps {
  x: number;
  y: number;
  onSelect: (kind: QuickSpawnKind) => void;
  onClose: () => void;
}

export const QuickConnectMenu = React.memo(function QuickConnectMenu({
  x,
  y,
  onSelect,
  onClose,
}: QuickConnectMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDocDown = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as globalThis.Node)) {
        onClose();
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("mousedown", onDocDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onDocDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose]);

  return (
    <div
      ref={menuRef}
      style={{ left: x, top: y }}
      className="nowheel absolute z-30 w-60 rounded-md border border-zinc-700 bg-zinc-900/95 backdrop-blur-sm p-1.5 shadow-xl"
    >
      <div className="px-1.5 pb-1 mb-1 border-b border-zinc-800 flex items-center justify-between">
        <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">
          Add connected shape
        </span>
        <span className="text-[9px] font-mono text-zinc-500">ESC</span>
      </div>
      <div className="grid grid-cols-2 gap-1">
        {QUICK_SPAWN_ITEMS.map((item) => (
          <button
            key={item.kind}
            type="button"
            onClick={() => onSelect(item.kind)}
            className="flex items-center gap-1.5 px-2 py-1.5 rounded text-left text-xs text-zinc-200 hover:bg-zinc-800 hover:text-white transition-colors"
          >
            <span className="text-zinc-400">{item.icon}</span>
            <span className="truncate">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
});

interface MultiSelectActionBarProps {
  selectedCount: number;
  selectedShapeCount: number;
  selectedColorableCount: number;
  commonShape: ShapeSwitchKind | null;
  commonColor: string | null;
  onChangeShape: (target: ShapeSwitchKind) => void;
  onChangeColor: (color: string) => void;
}

export const MultiSelectActionBar = React.memo(function MultiSelectActionBar({
  selectedCount,
  selectedShapeCount,
  selectedColorableCount,
  commonShape,
  commonColor,
  onChangeShape,
  onChangeColor,
}: MultiSelectActionBarProps) {
  if (
    selectedCount <= 1 ||
    (selectedShapeCount === 0 && selectedColorableCount === 0)
  ) {
    return null;
  }

  return (
    <div
      data-export-ignore="true"
      data-testid="multi-select-action-bar"
      className="nowheel absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 bg-zinc-900/95 backdrop-blur-sm border border-zinc-700 rounded-full px-3 py-1.5 shadow-xl whitespace-nowrap"
    >
      <span className="text-[11px] font-mono text-zinc-400 select-none">
        {selectedCount} selected
      </span>

      {selectedShapeCount > 0 && (
        <>
          <div className="w-px h-4 bg-zinc-700" />
          <div
            className="flex items-center gap-0.5"
            aria-label="Bulk shape switcher"
          >
            {SHAPE_SWITCH_ITEMS.map((item) => {
              const active = commonShape === item.kind;
              return (
                <button
                  key={item.kind}
                  type="button"
                  title={
                    selectedShapeCount < selectedCount
                      ? `${item.label} (${selectedShapeCount} shapes)`
                      : item.label
                  }
                  aria-label={`Change selected shapes to ${item.label}`}
                  onClick={() => onChangeShape(item.kind)}
                  className={`p-1 rounded transition-colors ${
                    active
                      ? "bg-zinc-700 text-white"
                      : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
                  }`}
                >
                  {item.icon}
                </button>
              );
            })}
          </div>
        </>
      )}

      {selectedColorableCount > 0 && (
        <>
          <div className="w-px h-4 bg-zinc-700" />
          <div
            className="flex items-center gap-1.5"
            aria-label="Bulk color picker"
          >
            {Object.entries(SHAPE_COLORS).map(([key, val]) => (
              <button
                key={key}
                type="button"
                aria-label={`Change selected color to ${key}`}
                onClick={() => onChangeColor(key)}
                className={`w-3 h-3 rounded-full ${val.dot} transition-opacity ${
                  commonColor === key
                    ? "ring-1 ring-white ring-offset-1 ring-offset-zinc-900"
                    : "opacity-65 hover:opacity-100"
                }`}
                title={key}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
});
