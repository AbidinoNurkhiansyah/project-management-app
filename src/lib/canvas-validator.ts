const MAX_CANVAS_BYTES = 800 * 1024; // 800 KB

export function validateCanvasPayloadSize(data: unknown): boolean {
  const json = JSON.stringify(data);
  const bytes = new Blob([json]).size;
  return bytes <= MAX_CANVAS_BYTES;
}
