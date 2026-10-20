export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api/v1").replace(
  /\/+$/,
  "",
);

export type ErrorDetails = Record<string, unknown>;

/** Every failed request becomes an ApiError carrying the backend's {code, message, details}. */
export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details: ErrorDetails;

  constructor(status: number, code: string, message: string, details: ErrorDetails = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

interface ErrorBody {
  error?: { code?: string; message?: string; details?: ErrorDetails };
}

async function send(path: string, init: RequestInit): Promise<Response> {
  try {
    return await fetch(`${API_BASE_URL}${path}`, init);
  } catch {
    throw new ApiError(
      0,
      "network_error",
      `Cannot reach the backend at ${API_BASE_URL}. Start it with "uv run uvicorn app.main:app" in the backend folder.`,
    );
  }
}

async function failure(response: Response): Promise<ApiError> {
  let body: ErrorBody | null = null;
  try {
    body = (await response.json()) as ErrorBody;
  } catch {
    // Not JSON - fall through to a generic message.
  }
  const err = body?.error;
  return new ApiError(
    response.status,
    err?.code ?? "http_error",
    err?.message ?? `The backend answered HTTP ${response.status}.`,
    err?.details ?? {},
  );
}

export async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await send(path, {
    ...init,
    headers: { "Content-Type": "application/json", ...init.headers },
  });
  if (!response.ok) throw await failure(response);
  if (response.status === 204) return undefined as T;
  try {
    return (await response.json()) as T;
  } catch {
    throw new ApiError(response.status, "invalid_response", "The backend returned a response that is not JSON.");
  }
}

export async function requestBlob(path: string): Promise<Blob> {
  const response = await send(path, {});
  if (!response.ok) throw await failure(response);
  return response.blob();
}
