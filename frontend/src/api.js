/** Django REST API base URL (origin only, no trailing slash). */
export function getApiBase() {
  let raw = import.meta.env.VITE_API_URL;
  if (typeof raw !== "string" || !raw.trim()) {
    return "http://127.0.0.1:8000";
  }
  raw = raw.trim().replace(/\/+$/, "");

  if (/^(postgres(ql)?:|mysql:)/i.test(raw)) {
    throw new Error(
      "VITE_API_URL looks like DATABASE_URL (a DB driver URL). Set it to your Django HTTP origin, e.g. https://<your-backend>.up.railway.app — never postgresql://…",
    );
  }

  let candidate = raw;
  if (!/^https?:\/\//i.test(candidate)) {
    candidate = `https://${candidate.replace(/^\/+/, "")}`;
  }

  let u;
  try {
    u = new URL(candidate);
  } catch {
    throw new Error(`Invalid VITE_API_URL (${JSON.stringify(import.meta.env.VITE_API_URL)}). Example: https://your-django.up.railway.app`);
  }

  const path = u.pathname.replace(/\/$/, "") || "";

  /** Common typo: pasted two Railway hosts as "https://frontend/hostname.up.railway.app". */
  const strayRailwayHost = path.match(/^\/([a-z0-9.-]+\.railway\.app)$/i);
  if (strayRailwayHost) {
    return `https://${strayRailwayHost[1]}`;
  }

  return u.origin;
}

const ACCESS_KEY = "team_task_access";
const REFRESH_KEY = "team_task_refresh";

export function getAccessToken() {
  return localStorage.getItem(ACCESS_KEY);
}

export function setTokens(access, refresh) {
  localStorage.setItem(ACCESS_KEY, access);
  if (refresh) localStorage.setItem(REFRESH_KEY, refresh);
  else localStorage.removeItem(REFRESH_KEY);
}

export function clearTokens() {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
}

/**
 * @param {string} path - begins with /api/
 * @param {RequestInit} [options]
 */
export async function apiFetch(path, options = {}) {
  const token = getAccessToken();
  const headers = new Headers(options.headers || {});
  const body = options.body;
  if (body != null && typeof body === "string" && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (token) headers.set("Authorization", `Bearer ${token}`);
  const res = await fetch(`${getApiBase()}${path}`, { ...options, headers });
  if (res.status === 401) {
    clearTokens();
    window.dispatchEvent(new CustomEvent("auth:unauthorized"));
  }
  return res;
}

export async function apiJson(path, options = {}) {
  const res = await apiFetch(path, options);
  const text = await res.text();
  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }
  if (!res.ok) {
    const msg = formatApiError(data, text, res);
    throw new Error(msg);
  }
  return data;
}

function formatApiError(data, text, res) {
  if (data && typeof data === "object") {
    if (typeof data.detail === "string") return data.detail;
    if (Array.isArray(data.detail)) return data.detail.map((d) => d?.msg || d).join(" ");
    const parts = Object.entries(data).map(([k, v]) => {
      const s = Array.isArray(v) ? v.map((x) => (typeof x === "string" ? x : x?.message || String(x))).join(" ") : String(v);
      return `${k}: ${s}`;
    });
    if (parts.length) return parts.join(" ");
  }
  if (text) return text;
  return res.statusText || "Request failed";
}

export async function loginWithPassword(username, password, expectedRole) {
  const payload = {
    username,
    password,
  };
  if (expectedRole === "admin" || expectedRole === "member") {
    payload.expected_role = expectedRole;
  }
  const res = await fetch(`${getApiBase()}/api/login/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const text = await res.text();
  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }
  if (!res.ok) {
    throw new Error(formatApiError(data, text, res) || "Login failed");
  }
  return data;
}

export async function signupRequest(payload) {
  const res = await fetch(`${getApiBase()}/api/signup/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const text = await res.text();
  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }
  if (!res.ok) {
    throw new Error(formatApiError(data, text, res) || "Sign up failed");
  }
  return data;
}
