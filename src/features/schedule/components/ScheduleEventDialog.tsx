"use client";

import React from "react";
import { usePathname } from "next/navigation";
import {
  Link2,
  FileText,
  Video,
  Loader2,
  ExternalLink,
  Clock,
  AlertCircle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProjectDoc } from "@/types/projects";
import { ScheduleEventDoc } from "@/types/schedule";
import { ScheduleEventCreateInput } from "../schemas/schedule.schema";
import { useScheduleEventForm } from "../hooks/useScheduleEventForm";
import { ScheduleEventMetaRow } from "./ScheduleEventMetaRow";
import { ScheduleEventDateSection } from "./ScheduleEventDateSection";
import { ScheduleEventLinksSection } from "./ScheduleEventLinksSection";

interface ScheduleEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projects: ProjectDoc[];
  lockedProjectId?: string | null;
  initialStartDate?: Date | null;
  editingEvent?: ScheduleEventDoc | null;
  onSubmit: (
    payload: ScheduleEventCreateInput,
    editingId?: string,
  ) => Promise<void>;
}

export function ScheduleEventDialog({
  open,
  onOpenChange,
  projects,
  lockedProjectId = null,
  initialStartDate = null,
  editingEvent = null,
  onSubmit,
}: ScheduleEventDialogProps) {
  const pathname = usePathname();
  const form = useScheduleEventForm({
    open,
    onOpenChange,
    projects,
    lockedProjectId,
    initialStartDate,
    editingEvent,
    onSubmit,
  });

  const googleConnectHref = form.user
    ? `/api/auth/google/url?userId=${encodeURIComponent(form.user.uid)}&returnTo=${encodeURIComponent(pathname || "/schedule")}`
    : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingEvent ? "Edit Schedule Event" : "New Schedule Event"}
          </DialogTitle>
          <DialogDescription>
            Add an activity, meeting, reminder, or task block with optional
            links.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit} className="space-y-4">
          {form.error && (
            <div className="flex items-start justify-between gap-2 rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-400">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{form.error}</span>
              </div>
              {form.needsGoogleConnect && googleConnectHref && (
                <a
                  href={googleConnectHref}
                  className="inline-flex items-center gap-1 shrink-0 rounded bg-white px-2.5 py-1 text-[11px] font-medium text-black hover:bg-zinc-200 transition-colors"
                >
                  Connect Google
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">Title</label>
            <Input
              autoFocus
              placeholder="e.g. Client Sync, Deep Work, Design Review..."
              value={form.title}
              onChange={(e) => form.setTitle(e.target.value)}
              maxLength={160}
              required
            />
          </div>

          <ScheduleEventMetaRow
            category={form.category}
            onCategoryChange={form.setCategory}
            lockedProjectId={lockedProjectId}
            projectId={form.projectId}
            projects={projects}
            onProjectChange={form.handleProjectChange}
            color={form.color}
            onColorChange={form.setColor}
          />

          <ScheduleEventDateSection
            allDay={form.allDay}
            onAllDayChange={form.setAllDay}
            startDate={form.startDate}
            onStartDateChange={form.handleStartDateChange}
            startTime={form.startTime}
            onStartTimeChange={form.handleStartTimeChange}
            endDate={form.endDate}
            onEndDateChange={form.setEndDate}
            endTime={form.endTime}
            onEndTimeChange={form.setEndTime}
          />

          {(!form.showLinks || !form.showNotes || !form.hasGoogleMeetLink) && (
            <div className="flex items-center gap-2 flex-wrap">
              {!form.hasGoogleMeetLink && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={form.handleGenerateGoogleMeet}
                  disabled={
                    form.generatingMeet ||
                    form.submitting ||
                    form.links.length >= 10
                  }
                  className="h-7 px-2.5 text-xs gap-1.5 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10 hover:text-emerald-300"
                >
                  {form.generatingMeet ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Video className="w-3.5 h-3.5" />
                  )}
                  {form.generatingMeet ? "Creating Meet..." : "Add Google Meet"}
                </Button>
              )}
              {!form.showLinks && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    form.setShowLinks(true);
                    if (form.links.length === 0) form.handleAddLink();
                  }}
                  className="h-7 px-2.5 text-xs gap-1.5 text-muted-foreground hover:text-foreground"
                >
                  <Link2 className="w-3.5 h-3.5" />
                  Add links{form.links.length > 0 && ` (${form.links.length})`}
                </Button>
              )}
              {!form.showNotes && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => form.setShowNotes(true)}
                  className="h-7 px-2.5 text-xs gap-1.5 text-muted-foreground hover:text-foreground"
                >
                  <FileText className="w-3.5 h-3.5" />
                  {form.description.trim() ? "Show notes" : "Add notes"}
                </Button>
              )}
            </div>
          )}

          {form.showLinks && (
            <ScheduleEventLinksSection
              links={form.links}
              onAddLink={form.handleAddLink}
              onUpdateLink={form.handleUpdateLink}
              onRemoveLink={form.handleRemoveLink}
              onHide={() => form.setShowLinks(false)}
            />
          )}

          {form.showNotes && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-foreground flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-muted-foreground" />
                  Notes / Description
                </label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => form.setShowNotes(false)}
                  className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                >
                  Hide
                </Button>
              </div>
              <textarea
                rows={3}
                placeholder="Agenda, checklist, or details..."
                value={form.description}
                onChange={(e) => form.setDescription(e.target.value)}
                maxLength={2000}
                className="w-full rounded-md border border-border bg-surface-card px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-zinc-500 resize-y"
              />
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={form.submitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={form.submitting}
              className="gap-1.5"
            >
              <Clock className="w-3.5 h-3.5" />
              {form.submitting
                ? "Saving..."
                : editingEvent
                  ? "Save Changes"
                  : "Create Event"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
