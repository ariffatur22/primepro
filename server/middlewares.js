import rateLimit from "express-rate-limit";
import { prisma } from "./db.js";
import { SESSION_MAX_AGE_SECONDS } from "./utils.js";

export const globalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Terlalu banyak request. Coba lagi sebentar." },
});

export const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Terlalu banyak percobaan login. Coba lagi nanti." },
});

export const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Terlalu banyak percobaan. Coba lagi dalam 1 jam." },
});

export async function requireAuth(req, res, next) {
  try {
    const token = req.cookies?.session_token;
    if (!token) return res.status(401).json({ error: "Unauthorized" });

    const session = await prisma.session.findUnique({
      where: { token },
      include: { user: true },
    });
    if (!session) return res.status(401).json({ error: "Unauthorized" });
    if (new Date(session.expiresAt).getTime() < Date.now()) {
      await prisma.session.delete({ where: { id: session.id } });
      return res.status(401).json({ error: "Session expired" });
    }
    if (!session.user.isActive) {
      return res.status(403).json({ error: "Akun nonaktif." });
    }

    const renewed = new Date(Date.now() + SESSION_MAX_AGE_SECONDS * 1000);
    await prisma.session.update({
      where: { id: session.id },
      data: { expiresAt: renewed },
    });

    req.user = session.user;
    next();
  } catch (error) {
    next(error);
  }
}

export function requireSuperadmin(req, res, next) {
  if (!req.user || req.user.role !== "superadmin") {
    return res.status(403).json({ error: "Forbidden: Superadmin access required" });
  }
  next();
}
