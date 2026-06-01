import bcrypt from "bcrypt";
import { Router } from "express";
import { prisma } from "./db.js";
import { authLimiter, requireAuth } from "./middlewares.js";
import { loginSchema } from "./validators.js";
import { createSessionToken, sanitizeUser, SESSION_MAX_AGE_SECONDS } from "./utils.js";

const LOCK_WINDOW_MS = 30 * 60 * 1000;
const LOCK_DURATION_MS = 15 * 60 * 1000;

export const authRouter = Router();

authRouter.post("/login", authLimiter, async (req, res, next) => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

    const { email, password } = parsed.data;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: "Email atau password salah." });
    if (!user.isActive) return res.status(403).json({ error: "Akun nonaktif." });
    if (user.lockoutUntil && new Date(user.lockoutUntil).getTime() > Date.now()) {
      const remaining = Math.ceil((new Date(user.lockoutUntil).getTime() - Date.now()) / 60000);
      return res.status(423).json({
        error: `Akun dikunci sementara karena terlalu banyak percobaan gagal. Coba lagi dalam ${remaining} menit.`,
      });
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      const now = Date.now();
      const shouldLock = user.failedLoginCount + 1 >= 5;
      const updated = {
        failedLoginCount: user.failedLoginCount + 1,
      };
      if (shouldLock) {
        updated.failedLoginCount = 0;
        updated.lockoutUntil = new Date(now + LOCK_DURATION_MS);
      } else if (user.updatedAt && now - new Date(user.updatedAt).getTime() > LOCK_WINDOW_MS) {
        updated.failedLoginCount = 1;
      }
      await prisma.user.update({ where: { id: user.id }, data: updated });
      return res.status(401).json({ error: "Email atau password salah." });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { failedLoginCount: 0, lockoutUntil: null },
    });

    const token = createSessionToken();
    const expiresAt = new Date(Date.now() + SESSION_MAX_AGE_SECONDS * 1000);
    await prisma.session.create({
      data: { token, userId: user.id, expiresAt },
    });

    res.cookie("session_token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: SESSION_MAX_AGE_SECONDS * 1000,
    });

    return res.json({ user: sanitizeUser(user) });
  } catch (error) {
    next(error);
  }
});

authRouter.post("/logout", requireAuth, async (req, res, next) => {
  try {
    const token = req.cookies?.session_token;
    if (token) {
      await prisma.session.deleteMany({ where: { token } });
    }
    res.clearCookie("session_token");
    return res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

authRouter.get("/me", requireAuth, async (req, res) => {
  return res.json({ user: sanitizeUser(req.user) });
});
