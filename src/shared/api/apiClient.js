// ================================================================
// FUOTUOKE Campus Eats — Centralized Axios API Client
// All frontend services use this to communicate with Express backend.
// ================================================================

import axios from "axios";

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

export function clearTokens() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("fuo_refresh_token");
}

// REST Convenience Wrappers
export const get = (endpoint) => apiClientInstance.get(endpoint).then(res => res.data);
export const post = (endpoint, body) => apiClientInstance.post(endpoint, body).then(res => res.data);
export const put = (endpoint, body) => apiClientInstance.put(endpoint, body).then(res => res.data);
export const patch = (endpoint, body) => apiClientInstance.patch(endpoint, body).then(res => res.data);
export const del = (endpoint) => apiClientInstance.delete(endpoint).then(res => res.data);

export const apiRequest = (endpoint, options = {}) => {
  const method = (options.method || "GET").toLowerCase();
  return apiClientInstance({
    url: endpoint,
    method,
    data: options.body,
    headers: options.headers
  }).then(res => res.data);
};

export default apiClientInstance;
