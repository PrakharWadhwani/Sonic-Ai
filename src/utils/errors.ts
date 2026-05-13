export class AppError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly details?: unknown;

  constructor(code: string, message: string, statusCode: number = 500, details?: unknown) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super("VALIDATION_ERROR", message, 400, details);
    this.name = "ValidationError";
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super("NOT_FOUND", `${resource} not found`, 404);
    this.name = "NotFoundError";
  }
}

export class AIServiceError extends AppError {
  constructor(message: string, details?: unknown) {
    super("AI_SERVICE_ERROR", message, 503, details);
    this.name = "AIServiceError";
  }
}

export class ShopifyError extends AppError {
  constructor(message: string, details?: unknown) {
    super("SHOPIFY_ERROR", message, 502, details);
    this.name = "ShopifyError";
  }
}

export function handleError(error: unknown): { code: string; message: string; statusCode: number } {
  if (error instanceof AppError) {
    return { code: error.code, message: error.message, statusCode: error.statusCode };
  }
  if (error instanceof Error) {
    return { code: "INTERNAL_ERROR", message: error.message, statusCode: 500 };
  }
  return { code: "UNKNOWN_ERROR", message: "An unexpected error occurred", statusCode: 500 };
}
