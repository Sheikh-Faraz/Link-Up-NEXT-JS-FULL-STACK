// 



export function getErrorMessage(
  err: unknown,
  fallback = "Something went wrong"
): string {

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

  if (err instanceof Error) {
    return err.message;
  }

  if (typeof err === "string") {
    return err;
  }

  return fallback;
}