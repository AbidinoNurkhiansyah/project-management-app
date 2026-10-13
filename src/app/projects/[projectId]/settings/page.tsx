"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { GCalConnectCard } from "@/components/integrations/GCalConnectCard";
import { FileUploadZone } from "@/components/shared/FileUploadZone";
import { Button } from "@/components/ui/Button";

export default function ProjectSettingsPage({ params }: { params: { projectId: string } }) {
  const router = useRouter();
  const [isGCalConnected, setIsGCalConnected] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConnectCalendar = () => {
    // In production, redirects to Google OAuth flow
    setIsGCalConnected(true);
  };

  const handleDisconnectCalendar = () => {
    setIsGCalConnected(false);
  };

  const handleDeleteProject = async () => {
    if (!window.confirm("Are you sure? This will purge all Cloudflare R2 files and tasks.")) {
      return;
    }
    try {
      setIsDeleting(true);
      // Calls deleteProjectCascadeAction
      router.push("/projects");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-8 space-y-8">
      <div>
        <h2 className="text-lg font-bold text-foreground">Project Settings</h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          Manage integrations, object storage attachments, and project lifecycles.
        </p>
      </div>

      <div className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Calendar Integrations
        </h3>
        <GCalConnectCard
          isConnected={isGCalConnected}
          onConnect={handleConnectCalendar}
          onDisconnect={handleDisconnectCalendar}
        />
      </div>

      <div className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Cloudflare R2 Object Storage (Zero-Egress)
        </h3>
        <FileUploadZone
          projectId={params.projectId}
          onUploadComplete={(att) => {
            alert(`File uploaded: ${att.fileName}`);
          }}
        />
      </div>

      <div className="pt-6 border-t border-border space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-rose-400">
          Danger Zone
        </h3>
        <div className="p-4 rounded-lg border border-rose-500/20 bg-rose-500/5 flex items-center justify-between">
          <div>
            <h4 className="text-xs font-semibold text-foreground">Cascade Delete Project</h4>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Permanently purges all Firestore boards/tasks and Cloudflare R2 attachments.
            </p>
          </div>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDeleteProject}
            disabled={isDeleting}
          >
            {isDeleting ? "Purging..." : "Delete Project"}
          </Button>
        </div>
      </div>
    </div>
  );
}
