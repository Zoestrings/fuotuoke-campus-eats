// Centralized Axios API Client
import axios from "axios";
import { handleMockRequest } from "./mockDb";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

// ── Lightweight GET cache (60s TTL) ──
// Prevents duplicate API calls when switching between tabs/pages.
const CACHE_TTL_MS = 60 * 1000;
const _cache = new Map();

function cacheGet(key) {
  const entry = _cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) { _cache.delete(key); return null; }
  return entry.data;
}
function cacheSet(key, data) {
  _cache.set(key, { data, expiresAt: Date.now() + CACHE_TTL_MS });
}
function cacheInvalidate(key) {
  // Invalidate the exact key and any cache key that starts with it
  for (const k of _cache.keys()) {
    if (k === key || k.startsWith(key.split("?")[0])) _cache.delete(k);
  }
}

const apiClientInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json"
  }
});

// ── 1. Request Interceptor: Attach JWT Bearer Token ──
apiClientInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── 2. Response Interceptor: Handle Token Expired (401) ──
apiClientInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry &&
      localStorage.getItem("fuo_refresh_token")
    ) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem("fuo_refresh_token");
        const res = await axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken });
        
        if (res.status === 200 && res.data.accessToken) {
          localStorage.setItem("accessToken", res.data.accessToken);
          apiClientInstance.defaults.headers.common["Authorization"] = `Bearer ${res.data.accessToken}`;
          originalRequest.headers["Authorization"] = `Bearer ${res.data.accessToken}`;
          return apiClientInstance(originalRequest);
        }
      } catch (err) {
        // Refresh token failed, perform logout cleanup
        localStorage.removeItem("accessToken");
        localStorage.removeItem("fuo_refresh_token");
      }
    }
    return Promise.reject(error);
  }
);

// Helper Methods matching original apiClient.js interface to support legacy imports
export function getToken() {
  return localStorage.getItem("accessToken");
}

export function setTokens(accessToken, refreshToken) {
  localStorage.setItem("accessToken", accessToken);
  if (refreshToken) {
    localStorage.setItem("fuo_refresh_token", refreshToken);
  }
}

const shouldUseMock = () => {
  // Mock mode is only allowed in development builds.
  const isDev = process.env.NODE_ENV === "development";
  if (!isDev) return false;

  // Within development, fall back to mock when no local API server is reachable
  // (i.e. not running on localhost and no explicit API URL pointing to a real server).
  const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
  const hasProdApi = process.env.REACT_APP_API_URL && !process.env.REACT_APP_API_URL.includes("localhost");
  return !isLocal && !hasProdApi;
};

export function clearTokens() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("fuo_refresh_token");
}

// REST Convenience Wrappers
export const get = (endpoint, { cache = true } = {}) => {
  if (shouldUseMock()) {
    return handleMockRequest("GET", endpoint);
  }
  // Return cached response if available
  if (cache) {
    const hit = cacheGet(endpoint);
    if (hit) return Promise.resolve(hit);
  }
  return apiClientInstance.get(endpoint).then(res => {
    if (cache) cacheSet(endpoint, res.data);
    return res.data;
  });
};

export const post = (endpoint, body) => {
  if (shouldUseMock()) {
    return handleMockRequest("POST", endpoint, body);
  }
  cacheInvalidate(endpoint);
  return apiClientInstance.post(endpoint, body).then(res => res.data);
};

export const put = (endpoint, body) => {
  if (shouldUseMock()) {
    return handleMockRequest("PUT", endpoint, body);
  }
  cacheInvalidate(endpoint);
  return apiClientInstance.put(endpoint, body).then(res => res.data);
};

export const patch = (endpoint, body) => {
  if (shouldUseMock()) {
    return handleMockRequest("PATCH", endpoint, body);
  }
  cacheInvalidate(endpoint);
  return apiClientInstance.patch(endpoint, body).then(res => res.data);
};

export const del = (endpoint) => {
  if (shouldUseMock()) {
    return handleMockRequest("DELETE", endpoint);
  }
  cacheInvalidate(endpoint);
  return apiClientInstance.delete(endpoint).then(res => res.data);
};

export const apiRequest = (endpoint, options = {}) => {
  if (shouldUseMock()) {
    return handleMockRequest(options.method || "GET", endpoint, options.body);
  }
  const method = (options.method || "GET").toLowerCase();
  return apiClientInstance({
    url: endpoint,
    method,
    data: options.body,
    headers: options.headers
  }).then(res => res.data);
};

export default apiClientInstance;
