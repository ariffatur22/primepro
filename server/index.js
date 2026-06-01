import "dotenv/config";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import { prisma } from "./db.js";
import { auditRouter } from "./routes.audit.js";
import { authRouter } from "./routes.auth.js";
import { contactRouter } from "./routes.contact.js";
import { propertiesRouter } from "./routes.properties.js";
import { adminsRouter } from "./routes.admins.js";
import { publicRouter } from "./routes.public.js";
import { globalLimiter } from "./middlewares.js";

const app = express();
const port = Number(process.env.PORT || 4000);
const allowedOrigin = process.env.FRONTEND_ORIGIN || "http://localhost:5173";

app.set("trust proxy", 1);
app.use(
  cors({
    origin: allowedOrigin,
    credentials: true,
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());
app.use(globalLimiter);

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

// Public routes (landing page consumption)
app.use("/api/public", publicRouter);

app.use("/api/auth", authRouter);
app.use("/api/properties", propertiesRouter);
app.use("/api/admins", adminsRouter);
app.use("/api/audit-log", auditRouter);
app.use("/api/contact", contactRouter);

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ error: "Internal Server Error" });
});

const server = app.listen(port, () => {
  console.log(`Prime Property API running on :${port}`);
});

async function shutdown() {
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
