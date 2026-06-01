import { z } from "zod";

const isDecimalWithMax = (maxDecimals) => (value) => {
  const parts = String(value).split(".");
  return parts.length === 1 || parts[1].length <= maxDecimals;
};

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const contactSchema = z.object({
  nama: z.string().min(2),
  email: z.string().email(),
  nomor_hp: z.string().regex(/^\d{10,}$/),
  pesan: z.string().min(10),
});

export const propertySchema = z.object({
  nama_property: z.string().min(3).max(100),
  group: z.string().max(100).optional().or(z.literal("")),
  lebar: z.number().positive().refine(isDecimalWithMax(2), "Maks 2 desimal"),
  panjang: z.number().positive().refine(isDecimalWithMax(2), "Maks 2 desimal"),
  hadap: z.array(z.enum(["Utara", "Selatan", "Timur", "Barat"])).min(1),
  tipe: z.enum(["ruko", "villa"]),
  tingkat: z.number().min(1).max(10).refine(isDecimalWithMax(1), "Maks 1 desimal"),
  price: z.number().int().positive(),
  carport: z.boolean(),
  status: z.enum(["in_stock", "sold_out"]),
  siap: z.enum(["siap_huni", "siap_kosong", "siap_huni_renovasi"]),
  maps_link: z
    .string()
    .url()
    .refine((value) => value.includes("google.com/maps"), "maps_link harus google.com/maps")
    .optional()
    .or(z.literal("")),
  kawasan: z.array(z.string().min(1)).min(1),
  gallery: z
    .array(
      z.string().url().refine(
        (value) => /\.(jpe?g|png|gif|webp|avif)(\?.*)?$/i.test(value),
        "Gallery harus berisi URL gambar langsung (.jpg/.png/.webp/.gif/.avif)"
      )
    )
    .optional(),
  isFeatured: z.boolean().optional(),
  unit: z.string().optional().or(z.literal("")),
});

export const adminCreateSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8),
});
