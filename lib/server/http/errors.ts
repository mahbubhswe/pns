/**
 * Typed HTTP errors. Throw these from services and route handlers; the shared
 * API handler converts them into the right status code and JSON body.
 */
export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details?: unknown;

  constructor(status: number, message: string, options: { code?: string; details?: unknown } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = options.code ?? ApiError.defaultCode(status);
    this.details = options.details;
  }

  static defaultCode(status: number): string {
    switch (status) {
      case 400:
        return "BAD_REQUEST";
      case 401:
        return "UNAUTHORIZED";
      case 403:
        return "FORBIDDEN";
      case 404:
        return "NOT_FOUND";
      case 405:
        return "METHOD_NOT_ALLOWED";
      case 409:
        return "CONFLICT";
      case 413:
        return "PAYLOAD_TOO_LARGE";
      case 422:
        return "UNPROCESSABLE";
      default:
        return "INTERNAL_ERROR";
    }
  }

  static badRequest(message = "Bad request", details?: unknown) {
    return new ApiError(400, message, { details });
  }
  static unauthorized(message = "Unauthorized") {
    return new ApiError(401, message);
  }
  static forbidden(message = "Forbidden") {
    return new ApiError(403, message);
  }
  static notFound(message = "Not found") {
    return new ApiError(404, message);
  }
  static conflict(message = "Conflict") {
    return new ApiError(409, message);
  }
  static payloadTooLarge(message = "Payload too large") {
    return new ApiError(413, message);
  }
  static internal(message = "Server error") {
    return new ApiError(500, message);
  }
}

export function isApiError(err: unknown): err is ApiError {
  return err instanceof ApiError;
}
