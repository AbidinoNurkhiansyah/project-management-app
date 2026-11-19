import React from "react";
import type { Metadata } from "next";
import { GlobalScheduleView } from "@/features/schedule";

export const metadata: Metadata = {
  title: "Schedule",
};

export default function SchedulePage() {
  return <GlobalScheduleView />;
}
