import { Router } from "express";
import { prisma } from "./db.js";
import { requireAuth, requireSuperadmin } from "./middlewares.js";
import { safeJson } from "./utils.js";

export const auditRouter = Router();

auditRouter.use(requireAuth, requireSuperadmin);

auditRouter.get("/", async (req, res, next) => {
  try {
    const page = Number(req.query.page || 1);
    const rows = Number(req.query.rows || 50);
    const action = req.query.action ? String(req.query.action) : undefined;
    const userId = req.query.userId ? String(req.query.userId) : undefined;
    const from = req.query.from ? new Date(String(req.query.from)) : undefined;
    const to = req.query.to ? new Date(String(req.query.to)) : undefined;

    const where = {
      ...(action ? { action } : {}),
      ...(userId ? { userId } : {}),
      ...(from || to
        ? {
            createdAt: {
              ...(from ? { gte: from } : {}),
              ...(to ? { lte: to } : {}),
            },
          }
        : {}),
    };

    const [total, data] = await Promise.all([
      prisma.auditLog.count({ where }),
      prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * rows,
        take: rows,
      }),
    ]);

    return res.json({ total, page, rows, data: safeJson(data) });
  } catch (error) {
    next(error);
  }
});
