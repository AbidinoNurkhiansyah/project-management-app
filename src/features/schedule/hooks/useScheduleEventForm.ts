"use client";

import { useState, useEffect, FormEvent } from "react";
import { useAuth } from "@/features/auth";
import { createGoogleMeetAction } from "@/features/integrations/actions/gcal.actions";
import { ProjectDoc } from "@/types/projects";
import { ScheduleCategory, ScheduleEventDoc } from "@/types/schedule";
import {
  SCHEDULE_COLORS,
  ScheduleEventCreateInput,
} from "../schemas/schedule.schema";
import {
  toDateInputValue,
  toTimeInputValue,
  combineDateAndTime,
} from "../utils/calendar.utils";
import {
  DraftLink,
  generateLinkId,
  getDefaultCreateScheduleTimes,
  getInitialEventColor,
  validateAndBuildEventPayload,
} from "../utils/event-form.utils";

export type { DraftLink };

interface UseScheduleEventFormParams {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projects: ProjectDoc[];
  lockedProjectId: string | null;
  initialStartDate: Date | null;
  editingEvent: ScheduleEventDoc | null;
  onSubmit: (
    payload: ScheduleEventCreateInput,
    editingId?: string,
  ) => Promise<void>;
}

export function useScheduleEventForm({
  open,
  onOpenChange,
  projects,
  lockedProjectId,
  initialStartDate,
  editingEvent,
  onSubmit,
}: UseScheduleEventFormParams) {
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<ScheduleCategory>("EVENT");
  const [allDay, setAllDay] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [endDate, setEndDate] = useState("");
  const [endTime, setEndTime] = useState("10:00");
  const [projectId, setProjectId] = useState("");
  const [color, setColor] = useState<string>(SCHEDULE_COLORS[0]);
  const [links, setLinks] = useState<DraftLink[]>([]);
  const [showLinks, setShowLinks] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [generatingMeet, setGeneratingMeet] = useState(false);
  const [needsGoogleConnect, setNeedsGoogleConnect] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setError(null);
    setNeedsGoogleConnect(false);

    if (editingEvent) {
      const s = new Date(editingEvent.startAt);
      const e = new Date(editingEvent.endAt);
      const existingLinks = (editingEvent.links ?? []).map((l) => ({
        id: l.id,
        label: l.label,
        url: l.url,
      }));
      setTitle(editingEvent.title);
      setDescription(editingEvent.description ?? "");
      setCategory(editingEvent.category);
      setAllDay(editingEvent.allDay);
      setStartDate(toDateInputValue(s));
      setStartTime(toTimeInputValue(s));
      setEndDate(toDateInputValue(e));
      setEndTime(toTimeInputValue(e));
      setProjectId(editingEvent.projectId ?? "");
      setColor(editingEvent.color || SCHEDULE_COLORS[0]);
      setLinks(existingLinks);
      setShowLinks(existingLinks.length > 0);
      setShowNotes(Boolean(editingEvent.description?.trim()));
      return;
    }

    const defaults = getDefaultCreateScheduleTimes(initialStartDate);
    setTitle("");
    setDescription("");
    setCategory("EVENT");
    setAllDay(false);
    setStartDate(defaults.startDate);
    setStartTime(defaults.startTime);
    setEndDate(defaults.endDate);
    setEndTime(defaults.endTime);
    setProjectId(lockedProjectId ?? "");
    setColor(getInitialEventColor(lockedProjectId, projects));
    setLinks([]);
    setShowLinks(false);
    setShowNotes(false);
  }, [open, editingEvent, initialStartDate, lockedProjectId, projects]);

  const handleStartDateChange = (nextStart: string) => {
    setStartDate(nextStart);
    if (endDate && nextStart > endDate) setEndDate(nextStart);
  };

  const handleStartTimeChange = (nextTime: string) => {
    setStartTime(nextTime);
    if (startDate === endDate && nextTime >= endTime) {
      const [h, m] = nextTime.split(":").map(Number);
      const nextH = Math.min(23, (h || 0) + 1);
      setEndTime(
        `${String(nextH).padStart(2, "0")}:${String(m || 0).padStart(2, "0")}`,
      );
    }
  };

  const handleProjectChange = (nextProjectId: string) => {
    setProjectId(nextProjectId);
    const proj = projects.find((p) => p.id === nextProjectId);
    if (proj?.color) setColor(proj.color);
  };

  const handleAddLink = () =>
    setLinks((prev) => [...prev, { id: generateLinkId(), label: "", url: "" }]);

  const handleUpdateLink = (
    id: string,
    field: "label" | "url",
    value: string,
  ) =>
    setLinks((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
    );

  const handleRemoveLink = (id: string) =>
    setLinks((prev) => prev.filter((item) => item.id !== id));

  const hasGoogleMeetLink = links.some((l) => /meet\.google\.com/i.test(l.url));

  const handleGenerateGoogleMeet = async () => {
    if (!user) return setError("Must be logged in to create a Google Meet link.");
    if (!startDate || !endDate) {
      return setError(
        "Start date and end date are required to generate Google Meet.",
      );
    }
    if (links.length >= 10) return setError("Maximum 10 links reached.");

    setError(null);
    setNeedsGoogleConnect(false);
    setGeneratingMeet(true);
    try {
      const idToken = await user.getIdToken();
      const result = await createGoogleMeetAction(
        {
          title: title.trim() || "Meeting",
          description: description.trim() || null,
          startAt: combineDateAndTime(startDate, allDay ? "09:00" : startTime),
          endAt: combineDateAndTime(endDate, allDay ? "10:00" : endTime),
        },
        idToken,
      );

      if (!result.ok) {
        setNeedsGoogleConnect(result.code === "NOT_CONNECTED");
        setError(result.error);
        return;
      }

      setLinks((prev) => [
        ...prev.filter((i) => i.label.trim() !== "" || i.url.trim() !== ""),
        { id: generateLinkId(), label: "Google Meet", url: result.meetUrl },
      ]);
      setShowLinks(true);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Failed to generate Google Meet",
      );
    } finally {
      setGeneratingMeet(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    const validated = validateAndBuildEventPayload({
      title,
      description,
      category,
      allDay,
      startDate,
      startTime,
      endDate,
      endTime,
      projectId,
      lockedProjectId,
      color,
      links,
      editingEvent,
    });
    if (!validated.ok) return setError(validated.error);

    try {
      setSubmitting(true);
      await onSubmit(validated.data, editingEvent?.id);
      onOpenChange(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save event");
    } finally {
      setSubmitting(false);
    }
  };

  return {
    user,
    title,
    setTitle,
    description,
    setDescription,
    category,
    setCategory,
    allDay,
    setAllDay,
    startDate,
    startTime,
    endDate,
    setEndDate,
    endTime,
    setEndTime,
    projectId,
    color,
    setColor,
    links,
    showLinks,
    setShowLinks,
    showNotes,
    setShowNotes,
    generatingMeet,
    needsGoogleConnect,
    hasGoogleMeetLink,
    error,
    submitting,
    handleStartDateChange,
    handleStartTimeChange,
    handleProjectChange,
    handleAddLink,
    handleUpdateLink,
    handleRemoveLink,
    handleGenerateGoogleMeet,
    handleSubmit,
  };
}
