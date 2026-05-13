import { z } from "zod";

// ─── API Response Envelope ─────────────────────────────────────────
export const ApiResponseSchema = z.object({
  success: z.boolean(),
  data: z.any().optional(),
  error: z
    .object({
      code: z.string(),
      message: z.string(),
      details: z.any().optional(),
    })
    .optional(),
  meta: z
    .object({
      requestId: z.string().optional(),
      timestamp: z.string().datetime(),
      processingTimeMs: z.number().optional(),
    })
    .optional(),
});
export type ApiResponse<T = unknown> = {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta?: {
    requestId?: string;
    timestamp: string;
    processingTimeMs?: number;
  };
};

// ─── Helper Functions ──────────────────────────────────────────────
export function successResponse<T>(data: T, meta?: Partial<ApiResponse["meta"]>): ApiResponse<T> {
  return {
    success: true,
    data,
    meta: {
      timestamp: new Date().toISOString(),
      ...meta,
    },
  };
}

export function errorResponse(
  code: string,
  message: string,
  details?: unknown,
  meta?: Partial<ApiResponse["meta"]>
): ApiResponse<never> {
  return {
    success: false,
    error: { code, message, details },
    meta: {
      timestamp: new Date().toISOString(),
      ...meta,
    },
  };
}
