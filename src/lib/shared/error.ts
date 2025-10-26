export function toError(err: unknown): Error {
  if (err instanceof Error) return err;
  if (typeof err === "string") return new Error(err);
  if (typeof err === "object" && err !== null) {
    if (hasMessage(err)) return new Error(err.message);
    if (hasErrorString(err)) return new Error(err.error);
    return new Error(JSON.stringify(err));
  }
  return new Error(String(err));
}

function hasMessage(obj: object): obj is { message: string } {
  return (
    "message" in obj &&
    typeof (obj as { message: unknown }).message === "string"
  );
}

function hasErrorString(obj: object): obj is { error: string } {
  return (
    "error" in obj && typeof (obj as { error: unknown }).error === "string"
  );
}
