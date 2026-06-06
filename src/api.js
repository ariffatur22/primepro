// Ganti bagian paling atas dengan ini:
const API_BASE = import.meta.env.VITE_API_URL || "http://103.247.11.40";

export class ApiError extends Error {
  constructor(message, status, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

async function apiCall(endpoint, options = {}) {
  // Sisanya biarkan persis sama seperti sebelumnya...
  const url = `${API_BASE}${endpoint}`;
  const {
    method = "GET",
    body = null,
    headers = {},
  } = options;
}
  // ... (lanjutkan kode Anda yang bawah tanpa diubah)