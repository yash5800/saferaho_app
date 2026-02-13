/**
 * API Error Types and Utilities
 * Provides consistent error handling across the application
 */

export enum ErrorType {
  NETWORK_ERROR = "NETWORK_ERROR",
  AUTHENTICATION_ERROR = "AUTHENTICATION_ERROR",
  AUTHORIZATION_ERROR = "AUTHORIZATION_ERROR",
  VALIDATION_ERROR = "VALIDATION_ERROR",
  SERVER_ERROR = "SERVER_ERROR",
  TIMEOUT_ERROR = "TIMEOUT_ERROR",
  NOT_FOUND_ERROR = "NOT_FOUND_ERROR",
  UNKNOWN_ERROR = "UNKNOWN_ERROR",
}

export interface ApiErrorDetails {
  type: ErrorType;
  message: string;
  statusCode?: number;
  field?: string;
  originalError?: any;
}

export class ApiError extends Error {
  public readonly type: ErrorType;
  public readonly statusCode?: number;
  public readonly field?: string;
  public readonly originalError?: any;
  public readonly isOperational: boolean;

  constructor(details: ApiErrorDetails) {
    super(details.message);
    this.name = "ApiError";
    this.type = details.type;
    this.statusCode = details.statusCode;
    this.field = details.field;
    this.originalError = details.originalError;
    this.isOperational = true; // Operational errors are expected and can be handled

    // Maintains proper stack trace for debugging
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError);
    }
  }

  public isNetworkError(): boolean {
    return (
      this.type === ErrorType.NETWORK_ERROR ||
      this.type === ErrorType.TIMEOUT_ERROR
    );
  }

  public isAuthError(): boolean {
    return (
      this.type === ErrorType.AUTHENTICATION_ERROR ||
      this.type === ErrorType.AUTHORIZATION_ERROR
    );
  }

  public toJSON() {
    return {
      name: this.name,
      type: this.type,
      message: this.message,
      statusCode: this.statusCode,
      field: this.field,
    };
  }
}

/**
 * Creates ApiError from axios error
 */
export function createApiErrorFromAxios(error: any): ApiError {
  // Network errors (no response from server)
  if (!error.response) {
    if (error.message === "No network connection") {
      return new ApiError({
        type: ErrorType.NETWORK_ERROR,
        message:
          "No internet connection. Please check your network and try again.",
        originalError: error,
      });
    }

    if (error.code === "ECONNABORTED" || error.message.includes("timeout")) {
      return new ApiError({
        type: ErrorType.TIMEOUT_ERROR,
        message: "Request timed out. Please try again.",
        originalError: error,
      });
    }

    return new ApiError({
      type: ErrorType.NETWORK_ERROR,
      message: "Unable to connect to server. Please check your network.",
      originalError: error,
    });
  }

  const { status, data } = error.response;

  // Authentication errors
  if (status === 401) {
    return new ApiError({
      type: ErrorType.AUTHENTICATION_ERROR,
      message: data?.message || "Authentication failed. Please sign in again.",
      statusCode: status,
      originalError: error,
    });
  }

  // Authorization errors
  if (status === 403) {
    return new ApiError({
      type: ErrorType.AUTHORIZATION_ERROR,
      message:
        data?.message || "You don't have permission to access this resource.",
      statusCode: status,
      originalError: error,
    });
  }

  // Not found errors
  if (status === 404) {
    return new ApiError({
      type: ErrorType.NOT_FOUND_ERROR,
      message: data?.message || "Requested resource not found.",
      statusCode: status,
      originalError: error,
    });
  }

  // Validation errors
  if (status === 400 || status === 422) {
    return new ApiError({
      type: ErrorType.VALIDATION_ERROR,
      message: data?.message || "Invalid data provided.",
      statusCode: status,
      field: data?.field,
      originalError: error,
    });
  }

  // Server errors
  if (status >= 500) {
    return new ApiError({
      type: ErrorType.SERVER_ERROR,
      message:
        data?.message || "Server error occurred. Please try again later.",
      statusCode: status,
      originalError: error,
    });
  }

  // Unknown errors
  return new ApiError({
    type: ErrorType.UNKNOWN_ERROR,
    message: data?.message || "An unexpected error occurred.",
    statusCode: status,
    originalError: error,
  });
}

/**
 * Handles API errors and returns user-friendly message
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "An unexpected error occurred. Please try again.";
}

/**
 * Logs error with context for debugging
 */
export function logError(context: string, error: unknown): void {
  const timestamp = new Date().toISOString();

  if (error instanceof ApiError) {
    console.error(`[${timestamp}] [${context}] ApiError:`, {
      type: error.type,
      message: error.message,
      statusCode: error.statusCode,
      field: error.field,
    });
  } else if (error instanceof Error) {
    console.error(`[${timestamp}] [${context}] Error:`, error.message);
  } else {
    console.error(`[${timestamp}] [${context}] Unknown error:`, error);
  }
}
