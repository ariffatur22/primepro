import bcrypt from "bcrypt";
import { Router } from "express";
import { prisma } from "./db.js";
import { getClientIp, safeJson } from "./utils.js";
import { adminCreateSchema } from "./validators.js";
import { requireAuth, requireSuperadmin } from "./middlewares.js";

export const adminsRouter = Router();

async function writeAuditLog({ userId, action, entityType, entityId, before, after, ipAddress }) {
  await prisma.auditLog.create({
    data: {
      userId,
      action,
      entityType,
      entityId: String(entityId),
      changes: { before, after },
      ipAddress,
    },
  });
}

adminsRouter.use(requireAuth, requireSuperadmin);

adminsRouter.get("/", async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      where: { role: "admin" },
      orderBy: { createdAt: "desc" },
    });
    return res.json({ data: safeJson(users) });
  } catch (error) {
    next(error);
  }
});

adminsRouter.post("/", async (req, res, next) => {
  try {
    const parsed = adminCreateSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

    const { name, email, password } = parsed.data;
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(409).json({ error: "Email sudah digunakan." });

    const passwordHash = await bcrypt.hash(password, 10);
    const created = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: "admin",
        isActive: true,
        createdBy: req.user.id,
      },
    });

    await writeAuditLog({
      userId: req.user.id,
      action: "admin_create",
      entityType: "user",
      entityId: created.id,
      before: null,
      after: safeJson(created),
      ipAddress: getClientIp(req),
    });

    return res.status(201).json({ data: safeJson(created) });
  } catch (error) {
    next(error);
  }
});

adminsRouter.patch("/:id/toggle-active", async (req, res, next) => {
  try {
    const target = await prisma.user.findFirst({
      where: { id: req.params.id, role: "admin" },
    });
    if (!target) return res.status(404).json({ error: "Admin tidak ditemukan." });

    const updated = await prisma.user.update({
      where: { id: req.params.id },
      data: { isActive: !target.isActive },
    });

    await writeAuditLog({
      userId: req.user.id,
      action: updated.isActive ? "admin_enable" : "admin_disable",
      entityType: "user",
      entityId: updated.id,
      before: safeJson(target),
      after: safeJson(updated),
      ipAddress: getClientIp(req),
    });

    return res.json({ data: safeJson(updated) });
  } catch (error) {
    next(error);
  }
});

adminsRouter.post("/:id/reset-password", async (req, res, next) => {
  try {
    const target = await prisma.user.findFirst({
      where: { id: req.params.id, role: "admin" },
    });
    if (!target) return res.status(404).json({ error: "Admin tidak ditemukan." });

    const tempPassword = `Prime${Math.random().toString(36).slice(2, 10)}!`;
    const passwordHash = await bcrypt.hash(tempPassword, 10);
    const updated = await prisma.user.update({
      where: { id: req.params.id },
      data: { passwordHash, failedLoginCount: 0, lockoutUntil: null },
    });

    await writeAuditLog({
      userId: req.user.id,
      action: "admin_reset_password",
      entityType: "user",
      entityId: updated.id,
      before: null,
      after: { reset: true },
      ipAddress: getClientIp(req),
    });

    return res.json({ temporary_password: tempPassword });
  } catch (error) {
    next(error);
  }
});
