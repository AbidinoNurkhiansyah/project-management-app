import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Personal Workspace | Project Management",
  description: "Linear-style project workspace with Kanban boards, flowchart canvas, and R2 zero-egress storage.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-background text-foreground antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
