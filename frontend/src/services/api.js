const BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";
const TIMEOUT_MS = 30000;

export class ApiError extends Error {
  constructor(message, status, endpoint) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.endpoint = endpoint;
  }
}

function withTimeout(promise, ms, endpoint) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      controller.signal.addEventListener("abort", () =>
        reject(new ApiError(`Request timed out after ${ms / 1000}s`, null, endpoint))
      )
    ),
  ]).finally(() => clearTimeout(timer));
}

async function handleResponse(res, endpoint) {
  if (!res.ok) {
    let message = `HTTP ${res.status}`;
    try {
      const body = await res.json();
      message = body.detail || body.message || message;
    } catch { /* not JSON */ }
    throw new ApiError(message, res.status, endpoint);
  }
  return res.json();
}

export async function detectWaste(file) {
  const endpoint = "/detect";
  const form = new FormData();
  form.append("file", file);
  const res = await withTimeout(
    fetch(`${BASE}${endpoint}`, { method: "POST", body: form }),
    TIMEOUT_MS, endpoint
  );
  return handleResponse(res, endpoint);
}

export async function getWasteInfo(category) {
  const endpoint = `/info/${category.toLowerCase()}`;
  const res = await withTimeout(fetch(`${BASE}${endpoint}`), 10000, endpoint);
  return handleResponse(res, endpoint);
}

export async function getCenters(lat, lng, category) {
  const endpoint = `/centers?lat=${lat}&lng=${lng}&category=${category.toLowerCase()}`;
  const res = await withTimeout(fetch(`${BASE}${endpoint}`), 15000, endpoint);
  return handleResponse(res, endpoint);
}
