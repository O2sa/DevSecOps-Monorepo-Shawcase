import { authStorage } from '../auth/auth-storage';

export class ApiError extends Error {
  public readonly status: number;
  public readonly errors?: Record<string, string | string[]>;

  constructor(message: string, status: number, errors?: Record<string, string | string[]>) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
  }
}

export async function apiClient<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const headers = new Headers(options.headers || {});

  // Automatically attach Bearer token if present and not already specified
  const token = authStorage.getAccessToken();
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  // Set default JSON Content-Type if request has a body and is a string
  if (options.body && typeof options.body === 'string' && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  // Set Accept header
  if (!headers.has('Accept')) {
    headers.set('Accept', 'application/json');
  }

  let response: Response;
  try {
    response = await fetch(url, {
      ...options,
      headers,
    });
  } catch (err: any) {
    throw new ApiError(
      'Unable to connect to the backend service. Please ensure services are running.',
      0
    );
  }

  // Handle 401 Unauthorized
  if (response.status === 401) {
    authStorage.notifyUnauthorized();
    let errorDetail = 'Authentication required';
    try {
      const data = await response.json();
      errorDetail = data.detail || data.message || errorDetail;
    } catch {
      // Use fallback errorDetail
    }
    throw new ApiError(errorDetail, 401);
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return null as unknown as T;
  }

  let responseData: any;
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    try {
      responseData = await response.json();
    } catch {
      responseData = null;
    }
  } else {
    responseData = await response.text();
  }

  if (!response.ok) {
    let message = 'An error occurred while processing your request';
    let errors: Record<string, string | string[]> | undefined;

    if (responseData && typeof responseData === 'object') {
      message = responseData.detail || responseData.message || message;
      if (responseData.errors && typeof responseData.errors === 'object') {
        errors = responseData.errors;
      }
    } else if (typeof responseData === 'string' && responseData.length > 0) {
      message = responseData;
    }

    throw new ApiError(message, response.status, errors);
  }

  return responseData as T;
}
