import { Router } from "express";
import { prisma } from "./db.js";
import { safeJson } from "./utils.js";

export const publicRouter = Router();

// Public endpoint: featured properties for landing page
publicRouter.get("/properties/featured", async (req, res, next) => {
  try {
    const featured = await prisma.property.findMany({
      where: { deletedAt: null, isFeatured: true },
      orderBy: { createdAt: "desc" },
      take: 6,
    });

    if (featured.length > 0) return res.json({ data: safeJson(featured) });

    const fallback = await prisma.property.findMany({
      where: { deletedAt: null, status: "in_stock" },
      orderBy: { createdAt: "desc" },
      take: 6,
    });

    return res.json({ data: safeJson(fallback) });
  } catch (error) {
    next(error);
  }
});

publicRouter.get("/properties/new", async (req, res, next) => {
  try {
    const latest = await prisma.property.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: "desc" },
      take: 6,
    });

    return res.json({ data: safeJson(latest) });
  } catch (error) {
    next(error);
  }
});
