"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  CheckSquare,
  StickyNote,
  Shapes,
  SquareDashed,
  Type,
  Link2,
  ChevronDown,
  Undo2,
  Redo2,
  Download,
  FileText,
  FileDown,
} from "lucide-react";
import { TaskDoc } from "@/types/tasks";
import { FlowchartShape } from "./ShapeNode";
import type { CanvasExportFormat } from "../utils/canvas-export";

export type CanvasNodeType =
  | "taskNode"
  | "noteNode"
  | "decisionNode"
  | "groupNode"
  | "textNode";

interface ShapeMenuItem {
  id: FlowchartShape | "decision";
  label: string;
  hint: string;
  icon: React.ReactNode;
}

const SHAPE_ITEMS: ShapeMenuItem[] = [
  {
    id: "terminator",
    label: "Start / End",
    hint: "Terminator",
    icon: (
      <svg viewBox="0 0 24 14" className="w-5 h-3.5 shrink-0">
        <rect x="1" y="1" width="22" height="12" rx="6" fill="none" stroke="currentColor" strokeWidth="1.6" />
      </svg>
    ),
  },
  {
    id: "process",
    label: "Process",
    hint: "Action / Step",
    icon: (
      <svg viewBox="0 0 24 14" className="w-5 h-3.5 shrink-0">
        <rect x="1" y="1" width="22" height="12" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
      </svg>
    ),
  },
  {
    id: "decision",
    label: "Decision",
    hint: "If / Branch",
    icon: (
      <svg viewBox="0 0 24 16" className="w-5 h-3.5 shrink-0">
        <polygon points="12,1 23,8 12,15 1,8" fill="none" stroke="currentColor" strokeWidth="1.6" />
      </svg>
    ),
  },
  {
    id: "io",
    label: "Input / Output",
    hint: "Data",
    icon: (
      <svg viewBox="0 0 24 14" className="w-5 h-3.5 shrink-0">
        <polygon points="5,1 23,1 19,13 1,13" fill="none" stroke="currentColor" strokeWidth="1.6" />
      </svg>
    ),
  },
  {
    id: "database",
    label: "Database",
    hint: "Storage",
    icon: (
      <svg viewBox="0 0 20 18" className="w-5 h-3.5 shrink-0">
        <ellipse cx="10" cy="4" rx="8" ry="2.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <path d="M2,4 L2,14 C2,15.5 5.5,16.5 10,16.5 C14.5,16.5 18,15.5 18,14 L18,4" fill="none" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    id: "document",
    label: "Document",
    hint: "Report / File",
    icon: (
      <svg viewBox="0 0 24 16" className="w-5 h-3.5 shrink-0">
        <path d="M1,1 L23,1 L23,12 C18,9 14,15 8,14 C4,13 2,14 1,13 Z" fill="none" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    id: "subprocess",
    label: "Subprocess",
    hint: "Predefined",
    icon: (
      <svg viewBox="0 0 24 14" className="w-5 h-3.5 shrink-0">
        <rect x="1" y="1" width="22" height="12" rx="1" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <line x1="5" y1="1" x2="5" y2="13" stroke="currentColor" strokeWidth="1.5" />
        <line x1="19" y1="1" x2="19" y2="13" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    id: "connector",
    label: "Connector",
    hint: "Circle / Node",
    icon: (
      <svg viewBox="0 0 16 16" className="w-5 h-3.5 shrink-0">
        <circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" strokeWidth="1.6" />
      </svg>
    ),
  },
];

interface CanvasToolbarProps {
  onAddNode: (type: CanvasNodeType) => void;
  onAddShape?: (shape: FlowchartShape) => void;
  onLinkTask?: (task: TaskDoc) => void;
  projectTasks?: TaskDoc[];
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  onExport?: (format: CanvasExportFormat) => void;
  selectedCount?: number;
  totalNodesCount?: number;
  exporting?: boolean;
}

export const CanvasToolbar = React.memo(function CanvasToolbar({
  onAddNode,
  onAddShape,
  onLinkTask,
  projectTasks = [],
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false,
  onExport,
  selectedCount = 0,
  totalNodesCount = 0,
  exporting = false,
}: CanvasToolbarProps) {
  const [openMenu, setOpenMenu] = useState<"shapes" | "tasks" | "export" | null>(
    null
  );
  const toolbarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!openMenu) return;
    const onDocClick = (e: MouseEvent) => {
      if (toolbarRef.current && !toolbarRef.current.contains(e.target as Node)) {
        setOpenMenu(null);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [openMenu]);

  return (
    <div
      ref={toolbarRef}
      className="absolute top-4 left-4 z-20 flex flex-wrap items-center gap-1 p-1 rounded-md border border-border bg-surface-elevated"
    >
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpenMenu((m) => (m === "shapes" ? null : "shapes"))}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium hover:bg-surface-hover text-foreground transition-colors"
          title="Flowchart shapes"
        >
          <Shapes className="w-3.5 h-3.5 text-violet-400" />
          <span>Shapes</span>
          <ChevronDown className="w-3 h-3 text-muted-foreground" />
        </button>

        {openMenu === "shapes" && (
          <div className="nowheel absolute left-0 top-full mt-1.5 w-52 rounded-md border border-border bg-zinc-900 p-1 z-30">
            {SHAPE_ITEMS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  if (item.id === "decision") {
                    onAddNode("decisionNode");
                  } else {
                    onAddShape?.(item.id);
                  }
                  setOpenMenu(null);
                }}
                className="w-full text-left flex items-center justify-between gap-2 px-2 py-1.5 rounded text-xs hover:bg-zinc-800 text-zinc-200 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <span className="text-zinc-400">{item.icon}</span>
                  <span>{item.label}</span>
                </span>
                <span className="text-[10px] font-mono text-zinc-500">
                  {item.hint}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={() => onAddNode("taskNode")}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium hover:bg-surface-hover text-foreground transition-colors"
        title="Add Task card"
      >
        <CheckSquare className="w-3.5 h-3.5 text-blue-400" />
        <span>Task</span>
      </button>

      <button
        type="button"
        onClick={() => onAddNode("noteNode")}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium hover:bg-surface-hover text-foreground transition-colors"
        title="Add Sticky Note"
      >
        <StickyNote className="w-3.5 h-3.5 text-amber-400" />
        <span>Note</span>
      </button>

      <button
        type="button"
        onClick={() => onAddNode("groupNode")}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium hover:bg-surface-hover text-foreground transition-colors"
        title="Add Section frame"
      >
        <SquareDashed className="w-3.5 h-3.5 text-emerald-400" />
        <span>Section</span>
      </button>

      <button
        type="button"
        onClick={() => onAddNode("textNode")}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium hover:bg-surface-hover text-foreground transition-colors"
        title="Add Text label"
      >
        <Type className="w-3.5 h-3.5 text-zinc-300" />
        <span>Text</span>
      </button>

      {onLinkTask && (
        <>
          <div className="w-px h-4 bg-border mx-0.5" />
          <div className="relative">
            <button
              type="button"
              onClick={() => setOpenMenu((m) => (m === "tasks" ? null : "tasks"))}
              className="flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium hover:bg-surface-hover text-foreground transition-colors"
              title="Import existing project task"
            >
              <Link2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Link Task</span>
              <ChevronDown className="w-3 h-3 text-muted-foreground" />
            </button>

            {openMenu === "tasks" && (
              <div className="nowheel absolute left-0 top-full mt-1.5 w-64 max-h-64 overflow-y-auto rounded-md border border-border bg-zinc-900 p-1 z-30">
                {projectTasks.length === 0 ? (
                  <p className="px-2.5 py-2 text-[11px] text-muted-foreground">
                    No tasks in this project yet.
                  </p>
                ) : (
                  projectTasks.map((task) => (
                    <button
                      key={task.id}
                      type="button"
                      onClick={() => {
                        onLinkTask(task);
                        setOpenMenu(null);
                      }}
                      className="w-full text-left flex items-center justify-between gap-2 px-2 py-1.5 rounded text-xs hover:bg-zinc-800 text-zinc-200 transition-colors"
                    >
                      <span className="truncate">{task.title}</span>
                      <span className="shrink-0 text-[9px] font-mono px-1 py-0.5 rounded bg-zinc-800 text-zinc-400">
                        {task.priority}
                      </span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        </>
      )}

      {(onUndo || onRedo) && (
        <>
          <div className="w-px h-4 bg-border mx-0.5" />
          <button
            type="button"
            onClick={onUndo}
            disabled={!canUndo}
            title="Undo (Ctrl+Z)"
            aria-label="Undo"
            className="flex items-center justify-center p-1.5 rounded text-foreground hover:bg-surface-hover disabled:opacity-35 disabled:pointer-events-none transition-colors"
          >
            <Undo2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={onRedo}
            disabled={!canRedo}
            title="Redo (Ctrl+Shift+Z)"
            aria-label="Redo"
            className="flex items-center justify-center p-1.5 rounded text-foreground hover:bg-surface-hover disabled:opacity-35 disabled:pointer-events-none transition-colors"
          >
            <Redo2 className="w-3.5 h-3.5" />
          </button>
        </>
      )}

      {onExport && (
        <>
          <div className="w-px h-4 bg-border mx-0.5" />
          <div className="relative">
            <button
              type="button"
              disabled={exporting || totalNodesCount === 0}
              onClick={() =>
                setOpenMenu((m) => (m === "export" ? null : "export"))
              }
              title={
                selectedCount > 0
                  ? `Export ${selectedCount} selected items`
                  : "Export canvas"
              }
              className="flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium hover:bg-surface-hover text-foreground disabled:opacity-40 disabled:pointer-events-none transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-sky-400" />
              <span>
                {exporting
                  ? "Exporting..."
                  : selectedCount > 0
                  ? `Export (${selectedCount})`
                  : "Export"}
              </span>
              <ChevronDown className="w-3 h-3 text-muted-foreground" />
            </button>

            {openMenu === "export" && (
              <div className="nowheel absolute right-0 top-full mt-1.5 w-48 rounded-md border border-border bg-zinc-900 p-1 z-30">
                <div className="px-2 py-1 text-[10px] font-mono text-zinc-400 border-b border-zinc-800 mb-1">
                  {selectedCount > 0
                    ? `Selected (${selectedCount})`
                    : `Full board (${totalNodesCount})`}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onExport("pdf");
                    setOpenMenu(null);
                  }}
                  className="w-full text-left flex items-center justify-between gap-2 px-2 py-1.5 rounded text-xs hover:bg-zinc-800 text-zinc-200 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <FileDown className="w-3.5 h-3.5 text-rose-400" />
                    <span>Export PDF</span>
                  </span>
                  <span className="text-[10px] font-mono text-zinc-500">
                    .pdf
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onExport("docx");
                    setOpenMenu(null);
                  }}
                  className="w-full text-left flex items-center justify-between gap-2 px-2 py-1.5 rounded text-xs hover:bg-zinc-800 text-zinc-200 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5 text-blue-400" />
                    <span>Export DOCX</span>
                  </span>
                  <span className="text-[10px] font-mono text-zinc-500">
                    .docx
                  </span>
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
});
