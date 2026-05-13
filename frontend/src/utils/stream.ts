import type { SSEEvent } from "@/types/chat";

/**
 * Creates a ReadableStream that sends Server-Sent Events.
 * Compatible with Next.js App Router route handlers.
 */
export function createSSEStream(): {
  stream: ReadableStream;
  writer: SSEWriter;
} {
  let controllerRef: ReadableStreamDefaultController | null = null;
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      controllerRef = controller;
    },
    cancel() {
      controllerRef = null;
    },
  });

  const writer: SSEWriter = {
    send(event: SSEEvent) {
      if (!controllerRef) return;
      const data = `data: ${JSON.stringify(event)}\n\n`;
      controllerRef.enqueue(encoder.encode(data));
    },
    sendText(text: string) {
      if (!controllerRef) return;
      const event: SSEEvent = { type: "message", data: { content: text } };
      const data = `data: ${JSON.stringify(event)}\n\n`;
      controllerRef.enqueue(encoder.encode(data));
    },
    close() {
      if (!controllerRef) return;
      const doneEvent: SSEEvent = { type: "done", data: null };
      const data = `data: ${JSON.stringify(doneEvent)}\n\n`;
      controllerRef.enqueue(encoder.encode(data));
      controllerRef.close();
      controllerRef = null;
    },
    sendError(message: string) {
      if (!controllerRef) return;
      const event: SSEEvent = { type: "error", data: { message } };
      const data = `data: ${JSON.stringify(event)}\n\n`;
      controllerRef.enqueue(encoder.encode(data));
      controllerRef.close();
      controllerRef = null;
    },
  };

  return { stream, writer };
}

export interface SSEWriter {
  send(event: SSEEvent): void;
  sendText(text: string): void;
  close(): void;
  sendError(message: string): void;
}

/**
 * Creates the SSE Response headers for Next.js route handler.
 */
export function sseHeaders(): HeadersInit {
  return {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
    "X-Accel-Buffering": "no",
  };
}
