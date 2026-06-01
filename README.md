# Prime Property

Frontend: React + Vite  
Backend: Express + Prisma + PostgreSQL

## Menjalankan proyek

1. Copy `.env.example` menjadi `.env`.
2. Install dependencies:
   - `npm install`
3. Generate Prisma client:
   - `npm run prisma:generate`
4. Jalankan migrasi:
   - `npm run prisma:migrate`
5. Seed data awal:
   - `npm run prisma:seed`
6. Jalankan frontend + backend:
   - `npm run dev:full`

## Endpoint utama (PRD Phase 1)

- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `GET /api/properties`
- `GET /api/properties/:id`
- `POST /api/properties` (Superadmin)
- `PUT /api/properties/:id` (Superadmin)
- `DELETE /api/properties/:id` (Superadmin, soft delete)
- `GET /api/admins` (Superadmin)
- `POST /api/admins` (Superadmin)
- `PATCH /api/admins/:id/toggle-active` (Superadmin)
- `POST /api/admins/:id/reset-password` (Superadmin)
- `GET /api/audit-log` (Superadmin)
- `POST /api/contact`
