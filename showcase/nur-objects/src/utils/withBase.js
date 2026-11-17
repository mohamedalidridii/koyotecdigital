// Prefixes a site path ("/studio") with the sub-path the piece is served from (NEXT_PUBLIC_BASE_PATH, set by the
// KOYOTEC showcase build). Plain <a> tags need it: unlike next/link, they do not add the basePath themselves.
export function withBase(path) {
  if (typeof path !== "string" || !path.startsWith("/") || path.startsWith("//")) return path;
  const base = process.env.NEXT_PUBLIC_BASE_PATH || "";
  return base + (path.endsWith("/") ? path : `${path}/`);
}
