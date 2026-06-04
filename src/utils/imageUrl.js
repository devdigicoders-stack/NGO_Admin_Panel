const IS_DEV = import.meta.env.DEV;

const API_ORIGIN =
  import.meta.env.VITE_SERVER_URL ||
  (import.meta.env.VITE_API_BASE || 'http://localhost:5002/api').replace(/\/api\/?$/, '');

/**
 * Resolve image path for display (supports /uploads from backend and /images from public).
 * In dev: Vite proxy routes /uploads → localhost:5002/uploads, so use relative path.
 * In prod: prepend the production backend origin.
 */
export function resolveImageUrl(path) {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  if (path.startsWith('data:')) return path; // base64 — return as-is
  if (path.startsWith('/uploads')) {
    return IS_DEV ? path : `${API_ORIGIN}${path}`;
  }
  return path;
}

export { API_ORIGIN };

