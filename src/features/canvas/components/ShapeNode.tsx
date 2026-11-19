"use client";

import React, { useState, useRef, useEffect } from "react";
import { NodeProps, NodeResizer, useReactFlow } from "@xyflow/react";
import {
  NodeQuickHandles,
  SHAPE_COLORS,
  ShapeQuickSwitcher,
  useCanvasQuickConnect,
} from "./canvas-quick-connect";

export type FlowchartShape =
  | "terminator"
  | "process"
  | "io"
  | "database"
  | "document"
  | "subprocess"
  | "connector";

function renderShapeSvg(
  shape: FlowchartShape,
  fill: string,
  stroke: string,
  strokeWidth: number
) {
  switch (shape) {
    case "terminator":
      return (
        <svg viewBox="0 0 160 56" preserveAspectRatio="none" className="absolute inset-0 w-full h-full pointer-events-none">
          <rect
            x="2"
            y="2"
            width="156"
            height="52"
            rx="26"
            ry="26"
            fill={fill}
            stroke={stroke}
            strokeWidth={strokeWidth}
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      );
    case "process":
      return (
        <svg viewBox="0 0 160 64" preserveAspectRatio="none" className="absolute inset-0 w-full h-full pointer-events-none">
          <rect
            x="2"
            y="2"
            width="156"
            height="60"
            rx="4"
            ry="4"
            fill={fill}
            stroke={stroke}
            strokeWidth={strokeWidth}
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      );
    case "io":
      return (
        <svg viewBox="0 0 160 64" preserveAspectRatio="none" className="absolute inset-0 w-full h-full pointer-events-none">
          <polygon
            points="22,2 158,2 138,62 2,62"
            fill={fill}
            stroke={stroke}
            strokeWidth={strokeWidth}
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      );
    case "database":
      return (
        <svg viewBox="0 0 120 84" preserveAspectRatio="none" className="absolute inset-0 w-full h-full pointer-events-none">
          <path
            d="M 4,14 L 4,70 C 4,77 29,82 60,82 C 91,82 116,77 116,70 L 116,14 Z"
            fill={fill}
            stroke={stroke}
            strokeWidth={strokeWidth}
            vectorEffect="non-scaling-stroke"
          />
          <ellipse
            cx="60"
            cy="14"
            rx="56"
            ry="11"
            fill={fill}
            stroke={stroke}
            strokeWidth={strokeWidth}
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      );
    case "document":
      return (
        <svg viewBox="0 0 160 76" preserveAspectRatio="none" className="absolute inset-0 w-full h-full pointer-events-none">
          <path
            d="M 2,2 L 158,2 L 158,60 C 122,46 102,78 60,70 C 30,64 14,72 2,66 Z"
            fill={fill}
            stroke={stroke}
            strokeWidth={strokeWidth}
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      );
    case "subprocess":
      return (
        <svg viewBox="0 0 160 64" preserveAspectRatio="none" className="absolute inset-0 w-full h-full pointer-events-none">
          <rect
            x="2"
            y="2"
            width="156"
            height="60"
            rx="3"
            ry="3"
            fill={fill}
            stroke={stroke}
            strokeWidth={strokeWidth}
            vectorEffect="non-scaling-stroke"
          />
          <line
            x1="16"
            y1="2"
            x2="16"
            y2="62"
            stroke={stroke}
            strokeWidth={strokeWidth}
            vectorEffect="non-scaling-stroke"
          />
          <line
            x1="144"
            y1="2"
            x2="144"
            y2="62"
            stroke={stroke}
            strokeWidth={strokeWidth}
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      );
    case "connector":
      return (
        <svg viewBox="0 0 72 72" preserveAspectRatio="none" className="absolute inset-0 w-full h-full pointer-events-none">
          <ellipse
            cx="36"
            cy="36"
            rx="33"
            ry="33"
            fill={fill}
            stroke={stroke}
            strokeWidth={strokeWidth}
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      );
  }
}

export const ShapeNode = React.memo(function ShapeNode({
  id,
  data,
  selected,
}: NodeProps) {
  const { updateNodeData } = useReactFlow();
  const quickConnect = useCanvasQuickConnect();
  const showColorPicker = selected && !quickConnect?.isMultiSelected;
  const shape = (data?.shape as FlowchartShape) || "process";
  const label = (data?.label as string) || "Process";
  const colorKey = (data?.color as string) || "zinc";
  const theme = SHAPE_COLORS[colorKey] || SHAPE_COLORS.zinc;

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(label);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setDraft(label);
  }, [label]);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  const commit = () => {
    setEditing(false);
    const trimmed = draft.trim() || label;
    if (trimmed !== label) {
      updateNodeData(id, { label: trimmed });
    }
  };

  const isCircle = shape === "connector";

  return (
    <>
      <NodeResizer
        minWidth={isCircle ? 52 : 100}
        minHeight={isCircle ? 52 : 44}
        keepAspectRatio={isCircle}
        isVisible={selected}
        lineClassName="!border-zinc-400"
        handleClassName="!w-2 !h-2 !bg-zinc-200 !border-zinc-900"
      />
      <div
        className="relative w-full h-full flex items-center justify-center"
        onDoubleClick={(e) => {
          e.stopPropagation();
          setEditing(true);
        }}
      >
        {showColorPicker && !editing && (
          <div
            data-export-ignore="true"
            className="nodrag nopan absolute -top-9 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-zinc-900 border border-zinc-700 rounded-full px-2 py-1 z-20 whitespace-nowrap shadow-lg"
          >
            <ShapeQuickSwitcher nodeId={id} currentShape={shape} />
            <div className="w-px h-3.5 bg-zinc-700" />
            <div className="flex items-center gap-1">
              {Object.entries(SHAPE_COLORS).map(([key, val]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => updateNodeData(id, { color: key })}
                  className={`w-2.5 h-2.5 rounded-full ${val.dot} ${
                    colorKey === key
                      ? "ring-1 ring-white ring-offset-1 ring-offset-zinc-900"
                      : "opacity-60 hover:opacity-100"
                  }`}
                  title={key}
                />
              ))}
            </div>
          </div>
        )}

        {renderShapeSvg(
          shape,
          theme.fill,
          selected ? theme.selectedStroke : theme.stroke,
          selected ? 2 : 1.5
        )}

        <NodeQuickHandles
          nodeId={id}
          nodeType="shapeNode"
          handleClassName="!w-2 !h-2 !bg-zinc-400"
        />

        <div
          className={`relative z-10 w-full text-center ${
            shape === "io" || shape === "subprocess"
              ? "px-6"
              : shape === "database"
              ? "px-3 pt-3"
              : shape === "document"
              ? "px-3 pb-2"
              : "px-3"
          }`}
        >
          {editing ? (
            <input
              ref={inputRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={commit}
              onKeyDown={(e) => {
                if (e.key === "Enter") commit();
                if (e.key === "Escape") {
                  setDraft(label);
                  setEditing(false);
                }
              }}
              className="nodrag nopan nowheel w-full bg-zinc-950/90 text-zinc-100 text-xs text-center px-1 py-0.5 rounded border border-zinc-400 outline-none"
            />
          ) : (
            <span className="text-xs font-medium text-zinc-100 leading-tight line-clamp-2 select-none">
              {label}
            </span>
          )}
        </div>
      </div>
    </>
  );
});
