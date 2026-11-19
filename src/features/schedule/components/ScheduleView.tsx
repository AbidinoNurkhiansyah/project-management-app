"use client";

import React, { useMemo, useState } from "react";
import { Plus, Calendar as CalendarIcon, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useProjects } from "@/features/projects";
import {
  CalendarItem,
  ScheduleCategory,
  ScheduleEventDoc,
  ScheduleViewMode,
} from "@/types/schedule";
import { ScheduleEventCreateInput } from "../schemas/schedule.schema";
import { useScheduleEvents } from "../hooks/useScheduleEvents";
import { useScheduleTasks } from "../hooks/useScheduleTasks";
import {
  eventsToCalendarItems,
  tasksToCalendarItems,
} from "../utils/calendar.utils";
import {
  stepScheduleDate,
  formatScheduleHeaderLabel,
  filterScheduleItems,
} from "../utils/schedule-view.utils";
import { ScheduleToolbar } from "./ScheduleToolbar";
import { MonthView } from "./MonthView";
import { TimeGridView } from "./TimeGridView";
import { ScheduleEventDialog } from "./ScheduleEventDialog";
import { ScheduleItemDetailDialog } from "./ScheduleItemDetailDialog";

interface ScheduleViewProps {
  /** Null/undefined = Global schedule. String = Scoped to one project. */
  projectId?: string | null;
}

export function ScheduleView({ projectId = null }: ScheduleViewProps) {
  const { projects } = useProjects();
  const {
    events,
    loading: eventsLoading,
    error: eventsError,
    createEvent,
    updateEvent,
    deleteEvent,
  } = useScheduleEvents(projectId);
  const {
    tasks,
    loading: tasksLoading,
    error: tasksError,
  } = useScheduleTasks(projectId);

  const [viewMode, setViewMode] = useState<ScheduleViewMode>("month");
  const [anchorDate, setAnchorDate] = useState<Date>(() => new Date());
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<
    ScheduleCategory | "ALL"
  >("ALL");
  const [projectFilter, setProjectFilter] = useState("ALL");
  const [showProjectTasks, setShowProjectTasks] = useState(true);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [initialStartDate, setInitialStartDate] = useState<Date | null>(null);
  const [editingEvent, setEditingEvent] = useState<ScheduleEventDoc | null>(
    null,
  );
  const [selectedItem, setSelectedItem] = useState<CalendarItem | null>(null);

  const projectsById = useMemo(
    () => new Map(projects.map((p) => [p.id, p])),
    [projects],
  );
  const activeProject = projectId ? projectsById.get(projectId) : undefined;

  const allItems = useMemo(() => {
    const eventItems = eventsToCalendarItems(events, projectsById);
    const taskItems = showProjectTasks
      ? tasksToCalendarItems(tasks, projectsById)
      : [];
    return [...eventItems, ...taskItems];
  }, [events, tasks, projectsById, showProjectTasks]);

  const filteredItems = useMemo(
    () =>
      filterScheduleItems(allItems, {
        projectId,
        projectFilter,
        categoryFilter,
        searchQuery,
      }),
    [allItems, projectId, projectFilter, categoryFilter, searchQuery],
  );

  const dateHeaderLabel = useMemo(
    () => formatScheduleHeaderLabel(anchorDate, viewMode),
    [anchorDate, viewMode],
  );

  const openCreateDialog = (date?: Date) => {
    setEditingEvent(null);
    setInitialStartDate(date ?? new Date());
    setIsFormOpen(true);
  };

  const openEditDialog = (event: ScheduleEventDoc) => {
    setInitialStartDate(null);
    setEditingEvent(event);
    setIsFormOpen(true);
  };

  const handleSubmitEvent = async (
    payload: ScheduleEventCreateInput,
    editingId?: string,
  ) => {
    if (editingId) {
      await updateEvent(editingId, payload);
    } else {
      await createEvent(payload);
    }
  };

  const isLoading = eventsLoading || tasksLoading;
  const loadError = eventsError || tasksError;

  return (
    <div className="h-full flex flex-col p-4 md:p-6 gap-4 max-w-[1600px] mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-blue-400 shrink-0" />
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              {projectId
                ? `${activeProject?.name ?? "Project"} Schedule`
                : "Schedule"}
            </h1>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            {projectId
              ? "Project events, meetings, links, and task due dates."
              : "All personal activities, project schedules, and task due dates in one calendar."}
          </p>
        </div>

        <Button
          onClick={() => openCreateDialog()}
          size="sm"
          className="gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Event</span>
        </Button>
      </div>

      <ScheduleToolbar
        dateHeaderLabel={dateHeaderLabel}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onNavigate={(dir) =>
          setAnchorDate((curr) => stepScheduleDate(curr, viewMode, dir))
        }
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        categoryFilter={categoryFilter}
        onCategoryFilterChange={setCategoryFilter}
        projectId={projectId}
        projectFilter={projectFilter}
        onProjectFilterChange={setProjectFilter}
        projects={projects}
        showProjectTasks={showProjectTasks}
        onToggleProjectTasks={() => setShowProjectTasks((prev) => !prev)}
      />

      {loadError && (
        <div className="flex items-center gap-2 rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-400">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>Failed to load schedule data: {loadError}</span>
        </div>
      )}

      {isLoading ? (
        <div className="flex-1 min-h-[540px] rounded-lg border border-border bg-surface-card animate-pulse" />
      ) : viewMode === "month" ? (
        <MonthView
          anchorDate={anchorDate}
          items={filteredItems}
          onSelectDateToCreate={(d) => openCreateDialog(d)}
          onSelectItem={setSelectedItem}
          onShowMoreForDay={(day) => {
            setAnchorDate(day);
            setViewMode("day");
          }}
        />
      ) : (
        <TimeGridView
          mode={viewMode}
          anchorDate={anchorDate}
          items={filteredItems}
          onSelectSlotToCreate={(d) => openCreateDialog(d)}
          onSelectItem={setSelectedItem}
        />
      )}

      <ScheduleEventDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        projects={projects}
        lockedProjectId={projectId}
        initialStartDate={initialStartDate}
        editingEvent={editingEvent}
        onSubmit={handleSubmitEvent}
      />

      <ScheduleItemDetailDialog
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
        onEditEvent={openEditDialog}
        onDeleteEvent={deleteEvent}
      />
    </div>
  );
}
