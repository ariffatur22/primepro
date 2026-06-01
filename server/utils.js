import crypto from "node:crypto";

export const SESSION_MAX_AGE_SECONDS = 2_592_000;

export function createSessionToken() {
  return crypto.randomBytes(48).toString("hex");
}

export function sanitizeUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    is_active: user.isActive,
  };
}

export function parseBigInt(value) {
  if (typeof value === "bigint") return value.toString();
  return value;
}

export function safeJson(data) {
  return JSON.parse(
    JSON.stringify(data, (_, value) => {
      if (typeof value === "bigint") return value.toString();
      return value;
    })
  );
}

export function getClientIp(req) {
  return req.headers["x-forwarded-for"]?.toString().split(",")[0]?.trim() || req.ip || "";
}
