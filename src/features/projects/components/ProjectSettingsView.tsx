"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { GCalConnectCard, FileUploadZone } from "@/features/integrations";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { useProjects } from "@/features/projects/hooks/useProjects";
import { useAuth } from "@/features/auth";

interface ProjectSettingsViewProps {
  projectId: string;
}

export function ProjectSettingsView({ projectId }: ProjectSettingsViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const gcalParam = searchParams.get("gcal");
  const gcalError = searchParams.get("gcal_error");

  const { user } = useAuth();
  const { deleteProject } = useProjects();
  const [isGCalConnected, setIsGCalConnected] = useState(
    gcalParam === "connected"
  );
  const [isDeleting, setIsDeleting] = useState(false);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const handleConnectCalendar = () => {
    if (!user) return;
    const qs = new URLSearchParams({ projectId, userId: user.uid });
    window.location.href = `/api/auth/google/url?${qs.toString()}`;
  };

  const handleConfirmDelete = async () => {
    try {
      setIsDeleting(true);
      setActionError(null);
      await deleteProject(projectId);
      router.push("/projects");
    } catch (err: unknown) {
      setActionError(
        err instanceof Error ? err.message : "Failed to delete project"
      );
      setIsDeleting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-8 space-y-8">
      <div>
        <h2 className="text-lg font-bold text-foreground">Project Settings</h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          Manage integrations, attachments, and project deletion.
        </p>
      </div>

      {actionError && (
        <div className="p-3 rounded-md border border-rose-500/20 bg-rose-500/10 text-rose-400 text-xs">
          {actionError}
        </div>
      )}

      {uploadSuccess && (
        <div className="p-3 rounded-md border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 text-xs flex items-center justify-between">
          <span>File uploaded: {uploadSuccess}</span>
          <button
            type="button"
            onClick={() => setUploadSuccess(null)}
            className="text-muted-foreground hover:text-foreground text-xs"
          >
            ✕
          </button>
        </div>
      )}

      {gcalParam === "connected" && (
        <div className="p-3 rounded-md border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 text-xs">
          Google Calendar connected. Deadlines will sync automatically.
        </div>
      )}

      {gcalError && (
        <div className="p-3 rounded-md border border-rose-500/20 bg-rose-500/10 text-rose-400 text-xs">
          Failed to connect Google Calendar: {gcalError}
        </div>
      )}

      <section className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Calendar Integration
        </h3>
        <GCalConnectCard
          isConnected={isGCalConnected}
          onConnect={handleConnectCalendar}
          onDisconnect={() => setIsGCalConnected(false)}
        />
      </section>

      <section className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Attachments
        </h3>
        <FileUploadZone
          projectId={projectId}
          onUploadComplete={(att) => setUploadSuccess(att.fileName)}
        />
      </section>

      <section className="pt-6 border-t border-border space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-rose-400">
          Danger Zone
        </h3>
        <div className="p-4 rounded-lg border border-rose-500/20 bg-rose-500/5 flex items-center justify-between">
          <div>
            <h4 className="text-xs font-semibold text-foreground">
              Delete Project
            </h4>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Permanently deletes all boards, tasks, and uploaded attachments.
            </p>
          </div>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setIsConfirmDeleteOpen(true)}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete Project"}
          </Button>
        </div>
      </section>

      <ConfirmDialog
        isOpen={isConfirmDeleteOpen}
        onClose={() => setIsConfirmDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Project"
        description="Are you sure you want to delete this project? This will permanently purge all tasks, boards, and Cloudflare R2 attachments. This action cannot be undone."
        confirmLabel={isDeleting ? "Deleting..." : "Delete Project"}
        cancelLabel="Cancel"
        isDestructive
      />
    </div>
  );
}
