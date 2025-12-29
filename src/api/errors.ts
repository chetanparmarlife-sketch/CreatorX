/**
 * API Error handling utilities
 * Provides structured error types and handling functions
 */

export class APIError extends Error {
  constructor(
    public status: number,
    public message: string,
    public code?: string,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'APIError';
    Object.setPrototypeOf(this, APIError.prototype);
  }
}

/**
 * Handle API errors and convert to APIError
 */
export const handleAPIError = (error: unknown): APIError => {
  // Check if it's already an APIError
  if (error instanceof APIError) {
    return error;
  }

  // Check if it's an Axios error
  if (error && typeof error === 'object' && 'response' in error) {
    const axiosError = error as {
      response?: {
        status: number;
        data?: {
          message?: string;
          error?: string;
          code?: string;
          details?: Record<string, unknown>;
        };
      };
      request?: unknown;
      message?: string;
    };

    if (axiosError.response) {
      const { status, data } = axiosError.response;
      return new APIError(
        status,
        data?.message || data?.error || 'An error occurred',
        data?.code,
        data?.details
      );
    } else if (axiosError.request) {
      // Network error - request was made but no response received
      return new APIError(
        0,
        'Network error. Please check your connection.',
        'NETWORK_ERROR'
      );
    }
  }

  // Generic error
  if (error instanceof Error) {
    return new APIError(0, error.message, 'UNKNOWN_ERROR');
  }

  return new APIError(0, 'An unexpected error occurred', 'UNKNOWN_ERROR');
};

/**
 * Check if error is a network error
 */
export const isNetworkError = (error: unknown): boolean => {
  if (error instanceof APIError) {
    return error.status === 0 || error.code === 'NETWORK_ERROR';
  }

  if (error instanceof Error) {
    return (
      error.message.includes('Network request failed') ||
      error.message.includes('Failed to fetch') ||
      error.message.includes('timeout') ||
      error.message.includes('Network Error')
    );
  }

  return false;
};

/**
 * Check if error is an authentication error
 */
export const isAuthError = (error: unknown): boolean => {
  if (error instanceof APIError) {
    return error.status === 401 || error.status === 403;
  }
  return false;
};

/**
 * Get user-friendly error message
 */
export const getErrorMessage = (error: unknown): string => {
  if (isNetworkError(error)) {
    return 'No internet connection. Please check your network and try again.';
  }

  if (error instanceof APIError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unexpected error occurred. Please try again.';
};


