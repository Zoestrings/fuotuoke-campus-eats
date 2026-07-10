// Centralized Axios API Client
import axios from "axios";
import { handleMockRequest } from "./mockDb";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

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
  // If we are in production on Vercel and no production API URL is set, use mock fallback.
  const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
  const hasProdApi = process.env.REACT_APP_API_URL && !process.env.REACT_APP_API_URL.includes("localhost");
  return !isLocal && !hasProdApi;
};

export function clearTokens() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("fuo_refresh_token");
}

// REST Convenience Wrappers
export const get = (endpoint) => {
  if (shouldUseMock()) {
    return handleMockRequest("GET", endpoint);
  }
  return apiClientInstance.get(endpoint).then(res => res.data);
};

export const post = (endpoint, body) => {
  if (shouldUseMock()) {
    return handleMockRequest("POST", endpoint, body);
  }
  return apiClientInstance.post(endpoint, body).then(res => res.data);
};

export const put = (endpoint, body) => {
  if (shouldUseMock()) {
    return handleMockRequest("PUT", endpoint, body);
  }
  return apiClientInstance.put(endpoint, body).then(res => res.data);
};

export const patch = (endpoint, body) => {
  if (shouldUseMock()) {
    return handleMockRequest("PATCH", endpoint, body);
  }
  return apiClientInstance.patch(endpoint, body).then(res => res.data);
};

export const del = (endpoint) => {
  if (shouldUseMock()) {
    return handleMockRequest("DELETE", endpoint);
  }
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
