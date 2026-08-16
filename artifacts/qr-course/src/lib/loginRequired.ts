/**
 * Global signalling for the "login required" gate.
 *
 * The backend returns 401 with a JSON body of
 *   { "error": "login_required", "message": ... }
 * from AI endpoints once an anonymous visitor has sampled enough of the
 * course. When that happens anywhere in the app we surface a modal prompting
 * a (free) Google sign-in. Ordinary 401s (e.g. from /api/auth/user) are
 * ignored so we never nag signed-out visitors who are just browsing.
 */

type Listener = (open: boolean) => void;

let _open = false;
const listeners = new Set<Listener>();

export function isLoginRequiredOpen(): boolean {
  return _open;
}

export function subscribeLoginRequired(fn: Listener): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

export function openLoginRequired(): void {
  if (_open) return;
  _open = true;
  listeners.forEach((fn) => fn(true));
}

export function closeLoginRequired(): void {
  if (!_open) return;
  _open = false;
  listeners.forEach((fn) => fn(false));
}

/**
 * The api-client throws an `ApiError` carrying `status`, `data`, and `url`.
 * We duck-type it here rather than importing the class, since it is not
 * re-exported from the package's public entrypoint.
 */
interface ApiErrorShape {
  status: number;
  url?: string;
  data?: unknown;
}

function isApiErrorShape(error: unknown): error is ApiErrorShape {
  return (
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    typeof (error as { status: unknown }).status === "number"
  );
}

function dataSaysLoginRequired(data: unknown): boolean {
  return (
    typeof data === "object" &&
    data !== null &&
    "error" in data &&
    (data as { error?: unknown }).error === "login_required"
  );
}

/**
 * Inspect an unknown error thrown by a query/mutation and, if it is a
 * login_required 401 (and not from the auth-user endpoint), open the gate
 * modal. Returns true when the modal was triggered.
 */
export function handleMaybeLoginRequired(error: unknown): boolean {
  if (!isApiErrorShape(error)) return false;
  if (error.status !== 401) return false;
  // Never trigger on the ordinary "am I logged in?" probe.
  if (error.url && error.url.includes("/api/auth/user")) return false;
  if (!dataSaysLoginRequired(error.data)) return false;
  openLoginRequired();
  return true;
}
