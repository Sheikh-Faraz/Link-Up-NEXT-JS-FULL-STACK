// utils/error.ts

export function getErrorMessage(
  err: unknown,
  fallback = "Something went wrong"
): string {
  if (typeof err === "string") return err;

  if (err instanceof Error) return err.message;

  if (
    err &&
    typeof err === "object" &&
    "response" in err &&
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (err as any).response?.data?.message
  ) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (err as any).response.data.message;
  }

  return fallback;
}
