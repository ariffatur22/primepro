const API_BASE = import.meta.env.VITE_API_URL || "http://103.247.11.40";

export class ApiError extends Error {
  constructor(message, status, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

async function apiCall(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const {
    method = "GET",
    body = null,
    headers = {},
  } = options;

  const config = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    credentials: "include", // Include cookies for cookie-based auth
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  try {
    const res = await fetch(url, config);
    const data = await res.json();

    if (!res.ok) {
      throw new ApiError(
        data.error || "Request failed",
        res.status,
        data
      );
    }

    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(error.message || "Network error", 0, null);
  }
}

// Auth
export const authApi = {
  login: (email, password) =>
    apiCall("/auth/login", {
      method: "POST",
      body: { email, password },
    }),
  logout: () =>
    apiCall("/auth/logout", { method: "POST" }),
  getMe: () =>
    apiCall("/auth/me"),
};

// Properties
export const propertiesApi = {
  list: (filters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "semua") {
        params.append(key, String(value));
      }
    });
    return apiCall(`/properties?${params.toString()}`);
  },
  get: (id) =>
    apiCall(`/properties/${id}`),
  create: (data) =>
    apiCall("/properties", {
      method: "POST",
      body: data,
    }),
  update: (id, data) =>
    apiCall(`/properties/${id}`, {
      method: "PUT",
      body: data,
    }),
  delete: (id) =>
    apiCall(`/properties/${id}`, {
      method: "DELETE",
    }),
  featured: () => apiCall(`/public/properties/featured`),
  new: () => apiCall(`/public/properties/new`),
  feature: (id, isFeatured) =>
    apiCall(`/properties/${id}/feature`, {
      method: "PATCH",
      body: { isFeatured },
    }),
};

// Admins
export const adminsApi = {
  list: () =>
    apiCall("/admins"),
  create: (data) =>
    apiCall("/admins", {
      method: "POST",
      body: data,
    }),
  toggleActive: (id) =>
    apiCall(`/admins/${id}/toggle-active`, {
      method: "PATCH",
    }),
  resetPassword: (id) => apiCall(`/admins/${id}/reset-password`, { method: "POST" }),
};

// Audit Log
export const auditApi = {
  list: (filters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, String(value));
      }
    });
    return apiCall(`/audit-log?${params.toString()}`);
  },
};