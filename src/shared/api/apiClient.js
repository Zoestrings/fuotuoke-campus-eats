// ================================================================
// FUOTUOKE Campus Eats — Centralized API Client
// All frontend services use this to communicate with Express backend.
// ================================================================

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

/**
 * Get the stored JWT access token.
 */
function getToken() {
  return localStorage.getItem("fuo_token");
}

/**
 * Store JWT tokens after login/signup.
 */
function setTokens(accessToken, refreshToken) {
  localStorage.setItem("fuo_token", accessToken);
  if (refreshToken) {
    localStorage.setItem("fuo_refresh_token", refreshToken);
  }
}

/**
 * Clear all auth tokens (logout).
 */
function clearTokens() {
  localStorage.removeItem("fuo_token");
  localStorage.removeItem("fuo_refresh_token");
  localStorage.removeItem("fuo_session");
  localStorage.removeItem("fuo_admin_session");
  localStorage.removeItem("fuo_vendor_session");
}

/**
 * Attempt to refresh the access token using the refresh token.
 */
async function refreshAccessToken() {
  const refreshToken = localStorage.getItem("fuo_refresh_token");
  if (!refreshToken) return null;

  try {
    const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken })
    });

    if (res.ok) {
      const data = await res.json();
      localStorage.setItem("fuo_token", data.accessToken);
      return data.accessToken;
    }
  } catch (e) {
    // Refresh failed
  }
  return null;
}

/**
 * Centralized fetch wrapper with JWT authentication.
 * Automatically attaches Bearer token and handles 401 refresh.
 *
 * @param {string} endpoint - API endpoint (e.g., "/auth/login")
 * @param {object} options  - fetch options (method, body, etc.)
 * @returns {Promise<object>} Parsed JSON response
 */
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = getToken();

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {})
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers
  };

  // Stringify body if it's an object
  if (config.body && typeof config.body === "object") {
    config.body = JSON.stringify(config.body);
  }

  let res = await fetch(url, config);

  // If 401, try refreshing the token once
  if (res.status === 401 && token) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      headers["Authorization"] = `Bearer ${newToken}`;
      res = await fetch(url, { ...config, headers });
    }
  }

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const error = new Error(data.error || `Request failed with status ${res.status}`);
    error.status = res.status;
    error.data = data;
    throw error;
  }

  return data;
}

// ── Convenience Methods ──

function get(endpoint) {
  return apiRequest(endpoint, { method: "GET" });
}

function post(endpoint, body) {
  return apiRequest(endpoint, { method: "POST", body });
}

function put(endpoint, body) {
  return apiRequest(endpoint, { method: "PUT", body });
}

function patch(endpoint, body) {
  return apiRequest(endpoint, { method: "PATCH", body });
}

function del(endpoint) {
  return apiRequest(endpoint, { method: "DELETE" });
}

export { apiRequest, get, post, put, patch, del, getToken, setTokens, clearTokens };
