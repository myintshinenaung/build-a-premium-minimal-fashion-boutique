type SupabaseLikeError = {
  code?: string;
  message?: string;
};

export function isRecoverableReadError(error: unknown) {
  if (!isSupabaseLikeError(error)) {
    return false;
  }

  return (
    error.code === "42P01" ||
    error.code === "PGRST116" ||
    error.code === "PGRST205" ||
    error.message?.toLowerCase().includes("failed to fetch") ||
    error.message?.toLowerCase().includes("could not find the table")
  );
}

export function createRepositoryError(action: string, error: unknown) {
  if (isSupabaseLikeError(error) && error.message) {
    return new Error(`${action}: ${error.message}`);
  }

  if (error instanceof Error) {
    return new Error(`${action}: ${error.message}`);
  }

  return new Error(action);
}

function isSupabaseLikeError(error: unknown): error is SupabaseLikeError {
  return typeof error === "object" && error !== null && ("code" in error || "message" in error);
}
