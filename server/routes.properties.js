import { Router } from "express";
import { prisma } from "./db.js";
import { getClientIp, safeJson } from "./utils.js";
import { propertySchema } from "./validators.js";
import { requireAuth, requireSuperadmin } from "./middlewares.js";

export const propertiesRouter = Router();

function mapPropertyForDb(payload, userId) {
  return {
    namaProperty: payload.nama_property,
    group: payload.group || null,
    lebar: payload.lebar,
    panjang: payload.panjang,
    hadap: payload.hadap,
    tipe: payload.tipe,
    tingkat: payload.tingkat,
    price: BigInt(payload.price),
    carport: payload.carport,
    status: payload.status,
    siap: payload.siap,
    mapsLink: payload.maps_link || null,
    kawasan: payload.kawasan,
    gallery: payload.gallery || [],
    isFeatured: payload.isFeatured || false,
    unit: payload.unit || null,
    createdById: userId,
  };
}

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

propertiesRouter.use(requireAuth);

propertiesRouter.get("/", async (req, res, next) => {
  try {
    const page = Number(req.query.page || 1);
    const rows = Number(req.query.rows || 50);
    const search = String(req.query.q || "").trim();
    const status = req.query.status && req.query.status !== "semua" ? String(req.query.status) : undefined;
    const tipe = req.query.tipe && req.query.tipe !== "semua" ? String(req.query.tipe) : undefined;
    const carport =
      req.query.carport && req.query.carport !== "semua" ? req.query.carport === "true" : undefined;
    const siap = req.query.siap && req.query.siap !== "semua" ? String(req.query.siap) : undefined;
    const kawasan = req.query.kawasan && req.query.kawasan !== "semua" ? String(req.query.kawasan) : undefined;
    const hadap = req.query.hadap && req.query.hadap !== "semua" ? String(req.query.hadap) : undefined;
    const lebarMin = req.query.lebarMin ? Number(req.query.lebarMin) : undefined;
    const hargaMax = req.query.hargaMax ? BigInt(req.query.hargaMax) : undefined;
    const sortByRaw = String(req.query.sortBy || "createdAt");
    const sortDir = String(req.query.sortDir || "desc");
    const sortByMap = {
      nama_property: "namaProperty",
      namaProperty: "namaProperty",
      price: "price",
      created_at: "createdAt",
      createdAt: "createdAt",
      status: "status",
    };
    const sortBy = sortByMap[sortByRaw] || "createdAt";

    const where = {
      deletedAt: null,
      ...(status ? { status } : {}),
      ...(tipe ? { tipe } : {}),
      ...(typeof carport === "boolean" ? { carport } : {}),
      ...(siap ? { siap } : {}),
      ...(kawasan ? { kawasan: { has: kawasan } } : {}),
      ...(hadap ? { hadap: { has: hadap } } : {}),
      ...(lebarMin ? { lebar: { gte: lebarMin } } : {}),
      ...(hargaMax ? { price: { lte: hargaMax } } : {}),
      ...(search
        ? {
            OR: [
              { namaProperty: { contains: search, mode: "insensitive" } },
              { group: { contains: search, mode: "insensitive" } },
              { kawasan: { hasSome: [search] } },
            ],
          }
        : {}),
    };

    const [total, rowsData] = await Promise.all([
      prisma.property.count({ where }),
      prisma.property.findMany({
        where,
        skip: (page - 1) * rows,
        take: rows,
        orderBy: { [sortBy]: sortDir === "asc" ? "asc" : "desc" },
      }),
    ]);

    return res.json({
      total,
      page,
      rows,
      data: safeJson(rowsData),
    });
  } catch (error) {
    next(error);
  }
});

propertiesRouter.get("/:id", async (req, res, next) => {
  try {
    const property = await prisma.property.findFirst({
      where: { id: req.params.id, deletedAt: null },
    });
    if (!property) return res.status(404).json({ error: "Properti tidak ditemukan." });
    return res.json({ data: safeJson(property) });
  } catch (error) {
    next(error);
  }
});

propertiesRouter.post("/", requireSuperadmin, async (req, res, next) => {
  try {
    const parsed = propertySchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

    const payload = parsed.data;
    const created = await prisma.property.create({
      data: mapPropertyForDb(payload, req.user.id),
    });

    await writeAuditLog({
      userId: req.user.id,
      action: "create",
      entityType: "property",
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

propertiesRouter.put("/:id", requireSuperadmin, async (req, res, next) => {
  try {
    const parsed = propertySchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

    const existing = await prisma.property.findFirst({
      where: { id: req.params.id, deletedAt: null },
    });
    if (!existing) return res.status(404).json({ error: "Properti tidak ditemukan." });

    const updated = await prisma.property.update({
      where: { id: req.params.id },
      data: mapPropertyForDb(parsed.data, existing.createdById),
    });

    await writeAuditLog({
      userId: req.user.id,
      action: "update",
      entityType: "property",
      entityId: updated.id,
      before: safeJson(existing),
      after: safeJson(updated),
      ipAddress: getClientIp(req),
    });

    return res.json({ data: safeJson(updated) });
  } catch (error) {
    next(error);
  }
});

propertiesRouter.delete("/:id", requireSuperadmin, async (req, res, next) => {
  try {
    const existing = await prisma.property.findFirst({
      where: { id: req.params.id, deletedAt: null },
    });
    if (!existing) return res.status(404).json({ error: "Properti tidak ditemukan." });

    const deleted = await prisma.property.update({
      where: { id: req.params.id },
      data: { deletedAt: new Date() },
    });

    await writeAuditLog({
      userId: req.user.id,
      action: "delete",
      entityType: "property",
      entityId: deleted.id,
      before: safeJson(existing),
      after: safeJson(deleted),
      ipAddress: getClientIp(req),
    });

    return res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

// Toggle feature flag for a property (superadmin only)
propertiesRouter.patch("/:id/feature", requireSuperadmin, async (req, res, next) => {
  try {
    const { isFeatured } = req.body;
    if (typeof isFeatured !== "boolean") return res.status(400).json({ error: "isFeatured must be boolean" });

    const existing = await prisma.property.findFirst({ where: { id: req.params.id, deletedAt: null } });
    if (!existing) return res.status(404).json({ error: "Properti tidak ditemukan." });

    const updated = await prisma.property.update({ where: { id: req.params.id }, data: { isFeatured } });

    await writeAuditLog({
      userId: req.user.id,
      action: isFeatured ? "feature_on" : "feature_off",
      entityType: "property",
      entityId: updated.id,
      before: safeJson(existing),
      after: safeJson(updated),
      ipAddress: getClientIp(req),
    });

    return res.json({ data: safeJson(updated) });
  } catch (error) {
    next(error);
  }
});
