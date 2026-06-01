import nodemailer from "nodemailer";
import { Router } from "express";
import { contactLimiter } from "./middlewares.js";
import { contactSchema } from "./validators.js";

export const contactRouter = Router();

async function sendContactMail(payload) {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) return;
  const hasSmtpConfig =
    process.env.SMTP_HOST && process.env.SMTP_PORT && process.env.SMTP_USER && process.env.SMTP_PASS;
  if (!hasSmtpConfig) return;

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: adminEmail,
    subject: `[Prime Property] Kontak baru dari ${payload.nama}`,
    text: `Nama: ${payload.nama}\nEmail: ${payload.email}\nNomor HP: ${payload.nomor_hp}\n\nPesan:\n${payload.pesan}`,
  });
}

contactRouter.post("/", contactLimiter, async (req, res, next) => {
  try {
    const parsed = contactSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
    await sendContactMail(parsed.data);
    return res.json({ success: true, message: "Pesan terkirim, tim kami akan menghubungi Anda." });
  } catch (error) {
    next(error);
  }
});
