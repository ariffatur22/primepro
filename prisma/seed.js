import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const superadminPassword = await bcrypt.hash("Superadmin123!", 10);
  const adminPassword = await bcrypt.hash("Admin12345!", 10);

  const superadmin = await prisma.user.upsert({
    where: { email: "superadmin@primeproperty.id" },
    update: {
      name: "Superadmin Prime",
      role: "superadmin",
      passwordHash: superadminPassword,
    },
    create: {
      name: "Superadmin Prime",
      email: "superadmin@primeproperty.id",
      role: "superadmin",
      passwordHash: superadminPassword,
      isActive: true,
    },
  });

  await prisma.user.upsert({
    where: { email: "admin@primeproperty.id" },
    update: {
      name: "Admin Prime",
      role: "admin",
      passwordHash: adminPassword,
    },
    create: {
      name: "Admin Prime",
      email: "admin@primeproperty.id",
      role: "admin",
      passwordHash: adminPassword,
      isActive: true,
      createdBy: superadmin.id,
    },
  });

  const seedProperties = [
    {
      namaProperty: "Aston Villas Type A",
      group: "Mentari",
      lebar: "6.00",
      panjang: "17.80",
      hadap: ["Utara"],
      tipe: "villa",
      tingkat: "2.0",
      price: BigInt(1350000000),
      carport: true,
      status: "in_stock",
      siap: "siap_huni",
      kawasan: ["Krakatau", "Pancing"],
      gallery: [
        "https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=80",
      ],
      isFeatured: true,
      unit: "Ready Siap huni",
      mapsLink: "https://maps.google.com/maps?q=medan",
      createdById: superadmin.id,
    },
    {
      namaProperty: "Banyan Tree Blok A",
      group: "Project Ville",
      lebar: "4.50",
      panjang: "21.50",
      hadap: ["Timur", "Barat"],
      tipe: "ruko",
      tingkat: "2.5",
      price: BigInt(980000000),
      carport: false,
      status: "sold_out",
      siap: "siap_kosong",
      kawasan: ["Cemara Asri/Kuala"],
      gallery: [
        "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80",
      ],
      isFeatured: false,
      unit: "Gate siap",
      createdById: superadmin.id,
    },
  ];

  for (const property of seedProperties) {
    await prisma.property.upsert({
      where: { id: `seed-${property.namaProperty.replace(/\s+/g, "-").toLowerCase()}` },
      update: property,
      create: {
        id: `seed-${property.namaProperty.replace(/\s+/g, "-").toLowerCase()}`,
        ...property,
      },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
