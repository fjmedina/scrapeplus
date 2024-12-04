export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export function handleApiError(error: any): never {
  if (error.response) {
    // API error response
    throw new ApiError(
      error.response.data.message || 'API request failed',
      error.response.status,
      error.response.data.code || 'UNKNOWN_ERROR',
      error.response.data
    );
  } else if (error.request) {
    // Network error
    throw new ApiError(
      'Network error occurred',
      0,
      'NETWORK_ERROR',
      error.request
    );
  } else {
    // Other errors
    throw new ApiError(
      error.message || 'An unexpected error occurred',
      500,
      'INTERNAL_ERROR'
    );
  }
}