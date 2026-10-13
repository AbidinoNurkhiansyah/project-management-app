"use client";

import React, { useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
} from "@dnd-kit/core";
import { TaskDoc } from "@/types/tasks";
import { KanbanColumn } from "./KanbanColumn";
import { TaskCard } from "./TaskCard";

interface KanbanBoardProps {
  tasks: TaskDoc[];
  onTaskReorder: (taskId: string, targetColumn: string, newOrder: number) => void;
  onTaskEdit: (task: TaskDoc) => void;
}

const DEFAULT_COLUMNS = [
  { id: "TODO", title: "To Do" },
  { id: "IN_PROGRESS", title: "In Progress" },
  { id: "DONE", title: "Done" },
];

export function KanbanBoard({
  tasks,
  onTaskReorder,
  onTaskEdit,
}: KanbanBoardProps) {
  const [activeTask, setActiveTask] = useState<TaskDoc | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const found = tasks.find((t) => t.id === event.active.id);
    setActiveTask(found ?? null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveTask(null);
    const { active, over } = event;
    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);
    const targetColumn = DEFAULT_COLUMNS.some((c) => c.id === overId)
      ? overId
      : tasks.find((t) => t.id === overId)?.columnId ?? "TODO";

    onTaskReorder(activeId, targetColumn, 1000);
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-3 overflow-x-auto p-4 h-[calc(100vh-140px)]">
        {DEFAULT_COLUMNS.map((col) => (
          <KanbanColumn
            key={col.id}
            columnId={col.id}
            title={col.title}
            tasks={tasks
              .filter((t) => t.columnId === col.id)
              .sort((a, b) => a.order - b.order)}
            onTaskEdit={onTaskEdit}
          />
        ))}
      </div>
      <DragOverlay>
        {activeTask ? <TaskCard task={activeTask} onEdit={() => {}} /> : null}
      </DragOverlay>
    </DndContext>
  );
}
