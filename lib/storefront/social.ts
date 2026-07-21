export function getInstagramHandle(instagramUrl: string) {
  if (!instagramUrl.trim()) {
    return "";
  }

  try {
    const pathname = new URL(instagramUrl).pathname.replace(/^\//, "");
    const handle = pathname.split("/").filter(Boolean)[0];

    if (!handle) {
      return "";
    }

    return handle.startsWith("@") ? handle : `@${handle}`;
  } catch {
    const trimmed = instagramUrl.trim();
    return trimmed.startsWith("@") ? trimmed : `@${trimmed.replace(/^@/, "")}`;
  }
}
