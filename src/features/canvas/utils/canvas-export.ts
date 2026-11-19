import {
  Node,
  Edge,
  getNodesBounds,
  getViewportForBounds,
} from "@xyflow/react";

export type CanvasExportFormat = "pdf" | "docx";

interface ExportCanvasOptions {
  container: HTMLElement;
  nodes: Node[];
  edges: Edge[];
  format: CanvasExportFormat;
  title?: string;
}

interface CapturedCanvas {
  dataUrl: string;
  width: number;
  height: number;
  targetNodes: Node[];
  isSelection: boolean;
}

const MAX_EXPORT_DIMENSION = 2000;
const EXPORT_PADDING = 48;

function getNodeDisplayText(node: Node): string {
  const data = (node.data || {}) as Record<string, unknown>;
  if (typeof data.title === "string" && data.title.trim()) return data.title.trim();
  if (typeof data.label === "string" && data.label.trim()) return data.label.trim();
  if (typeof data.text === "string" && data.text.trim()) return data.text.trim();
  return node.type || "Item";
}

function dataUrlToUint8Array(dataUrl: string): Uint8Array {
  const base64 = dataUrl.split(",")[1] || "";
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

const EXPORT_STYLE_CSS = `
.canvas-export-mode .react-flow__node svg rect,
.canvas-export-mode .react-flow__node svg polygon,
.canvas-export-mode .react-flow__node svg path,
.canvas-export-mode .react-flow__node svg ellipse,
.canvas-export-mode .react-flow__node svg circle {
  fill: none !important;
}
.canvas-export-mode .react-flow__node > div {
  background-color: transparent !important;
  box-shadow: none !important;
}
.canvas-export-mode .react-flow__node-taskNode > div {
  border-color: #3f3f46 !important;
}
.canvas-export-mode .react-flow__node span,
.canvas-export-mode .react-flow__node p {
  color: #09090b !important;
}
.canvas-export-mode .react-flow__edge-path {
  stroke: #27272a !important;
}
.canvas-export-mode .react-flow__edge-textbg {
  fill: #ffffff !important;
}
.canvas-export-mode .react-flow__edge-text {
  fill: #09090b !important;
}
`;

async function captureCanvasImage(
  container: HTMLElement,
  nodes: Node[],
  edges: Edge[]
): Promise<CapturedCanvas | null> {
  const selectedNodes = nodes.filter((n) => n.selected);
  const isSelection = selectedNodes.length > 0;
  const targetNodes = isSelection ? selectedNodes : nodes;
  if (targetNodes.length === 0) return null;

  const viewportEl = container.querySelector(
    ".react-flow__viewport"
  ) as HTMLElement | null;
  if (!viewportEl) return null;

  const bounds = getNodesBounds(targetNodes);
  const rawW = Math.max(bounds.width + EXPORT_PADDING * 2, 320);
  const rawH = Math.max(bounds.height + EXPORT_PADDING * 2, 200);
  const scale = Math.min(1, MAX_EXPORT_DIMENSION / Math.max(rawW, rawH));
  const width = Math.round(rawW * scale);
  const height = Math.round(rawH * scale);

  const viewport = getViewportForBounds(bounds, width, height, 0.1, 2, 0.08);

  const selectedIds = new Set(targetNodes.map((n) => n.id));
  const includedEdgeIds = new Set(
    edges
      .filter((e) => selectedIds.has(e.source) && selectedIds.has(e.target))
      .map((e) => e.id)
  );

  const styleEl = document.createElement("style");
  styleEl.textContent = EXPORT_STYLE_CSS;
  document.head.appendChild(styleEl);
  viewportEl.classList.add("canvas-export-mode");

  // Directly clear SVG fill attributes on shape primitives (html-to-image preserves raw SVG attributes)
  const savedSvgAttrs: Array<{
    el: Element;
    fill: string | null;
    stroke: string | null;
  }> = [];
  viewportEl
    .querySelectorAll(
      ".react-flow__node svg rect, .react-flow__node svg polygon, .react-flow__node svg path, .react-flow__node svg ellipse, .react-flow__node svg circle"
    )
    .forEach((el) => {
      const origFill = el.getAttribute("fill");
      const origStroke = el.getAttribute("stroke");
      savedSvgAttrs.push({ el, fill: origFill, stroke: origStroke });
      el.setAttribute("fill", "none");
      if (origStroke === "#e4e4e7") {
        el.setAttribute("stroke", "#3f3f46");
      }
    });

  try {
    const { toPng } = await import("html-to-image");
    const dataUrl = await toPng(viewportEl, {
      width,
      height,
      pixelRatio: 2,
      style: {
        width: `${width}px`,
        height: `${height}px`,
        transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`,
      },
      filter: (domNode) => {
        if (!(domNode instanceof Element)) {
          return true;
        }
        if (domNode.getAttribute("data-export-ignore") === "true") {
          return false;
        }
        const cls = domNode.classList;
        if (
          cls.contains("react-flow__resize-control") ||
          cls.contains("react-flow__handle")
        ) {
          return false;
        }
        if (isSelection) {
          if (cls.contains("react-flow__node")) {
            const id = domNode.getAttribute("data-id") || "";
            return selectedIds.has(id);
          }
          if (cls.contains("react-flow__edge")) {
            const id = domNode.getAttribute("data-id") || "";
            return includedEdgeIds.has(id);
          }
        }
        return true;
      },
    });

    return { dataUrl, width, height, targetNodes, isSelection };
  } finally {
    for (const { el, fill, stroke } of savedSvgAttrs) {
      if (fill === null) el.removeAttribute("fill");
      else el.setAttribute("fill", fill);
      if (stroke === null) el.removeAttribute("stroke");
      else el.setAttribute("stroke", stroke);
    }
    viewportEl.classList.remove("canvas-export-mode");
    styleEl.remove();
  }
}

export async function exportCanvas({
  container,
  nodes,
  edges,
  format,
  title = "Canvas Board",
}: ExportCanvasOptions): Promise<boolean> {
  const captured = await captureCanvasImage(container, nodes, edges);
  if (!captured) return false;

  const dateStr = new Date().toISOString().slice(0, 10);
  const scopeSlug = captured.isSelection ? "selection" : "board";
  const scopeLabel = captured.isSelection
    ? `Selection (${captured.targetNodes.length} items)`
    : `Full Board (${captured.targetNodes.length} items)`;

  if (format === "pdf") {
    const { jsPDF } = await import("jspdf");
    const orientation =
      captured.width >= captured.height ? "landscape" : "portrait";
    const pdf = new jsPDF({
      orientation,
      unit: "pt",
      format: "a4",
    });

    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();
    const margin = 32;
    const headerH = 34;

    pdf.setFontSize(13);
    pdf.setTextColor(24, 24, 27);
    pdf.text(title, margin, margin + 10);

    pdf.setFontSize(9);
    pdf.setTextColor(113, 113, 122);
    pdf.text(`${scopeLabel}  •  ${dateStr}`, margin, margin + 24);

    const maxW = pageW - margin * 2;
    const maxH = pageH - margin * 2 - headerH;
    const imgScale = Math.min(maxW / captured.width, maxH / captured.height);
    const drawW = captured.width * imgScale;
    const drawH = captured.height * imgScale;
    const drawX = margin + (maxW - drawW) / 2;
    const drawY = margin + headerH + (maxH - drawH) / 2;

    pdf.addImage(captured.dataUrl, "PNG", drawX, drawY, drawW, drawH);
    pdf.save(`canvas-${scopeSlug}-${dateStr}.pdf`);
    return true;
  }

  const { Document, Packer, Paragraph, TextRun, ImageRun, HeadingLevel } =
    await import("docx");

  const maxDocW = 580;
  const maxDocH = 680;
  const docScale = Math.min(
    maxDocW / captured.width,
    maxDocH / captured.height,
    1
  );
  const imgW = Math.round(captured.width * docScale);
  const imgH = Math.round(captured.height * docScale);

  const summaryItems = captured.targetNodes.map(
    (n) =>
      new Paragraph({
        bullet: { level: 0 },
        children: [
          new TextRun({
            text: getNodeDisplayText(n),
            size: 20,
          }),
        ],
      })
  );

  const doc = new Document({
    sections: [
      {
        children: [
          new Paragraph({
            heading: HeadingLevel.HEADING_1,
            children: [new TextRun({ text: title })],
          }),
          new Paragraph({
            spacing: { after: 200 },
            children: [
              new TextRun({
                text: `${scopeLabel} • ${dateStr}`,
                color: "71717A",
                size: 18,
              }),
            ],
          }),
          new Paragraph({
            spacing: { after: 240 },
            children: [
              new ImageRun({
                type: "png",
                data: dataUrlToUint8Array(captured.dataUrl),
                transformation: {
                  width: imgW,
                  height: imgH,
                },
              }),
            ],
          }),
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 120, after: 100 },
            children: [new TextRun({ text: "Items Included" })],
          }),
          ...summaryItems,
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  triggerDownload(blob, `canvas-${scopeSlug}-${dateStr}.docx`);
  return true;
}
