# Setup Guide - Prime Property Frontend Integration

## Prerequisites Setup

### 1. PostgreSQL Database Setup

Anda perlu setup PostgreSQL di local machine. Pilih salah satu:

#### Option A: Using Docker (Recommended)
```bash
docker run --name prime-pg \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=prime_property \
  -p 5432:5432 \
  -d postgres:15
```

#### Option B: Install PostgreSQL Locally
- Ubuntu/Debian: `sudo apt install postgresql postgresql-contrib`
- macOS: `brew install postgresql@15`
- Windows: Download dari https://www.postgresql.org/download/

Setelah install, create database:
```bash
createdb -U postgres prime_property
```

### 2. Verify Database Connection
```bash
psql -U postgres -d prime_property -c "SELECT version();"
```

Jika berhasil, lanjut ke step berikutnya.

## Backend Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Environment Variables
File `.env` sudah dibuat di root project dengan config default.
Update jika perlu:
```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/prime_property
PORT=4000
NODE_ENV=development
FRONTEND_ORIGIN=http://localhost:5173
```

### 3. Run Prisma Migration
```bash
npm run prisma:migrate
```

Pilih nama migration atau press Enter untuk auto-generate:
```
✔ Name of migration … init
```

### 4. Seed Database with Test Data
```bash
npm run prisma:seed
```

Ini akan membuat:
- **Superadmin**: superadmin@primeproperty.id / Superadmin123!
- **Admin**: admin@primeproperty.id / Admin12345!
- Sample properties (dari seed data)

### 5. Start Backend Server
Terminal 1:
```bash
npm run dev:server
```

Expected output:
```
Prime Property API running on :4000
```

## Frontend Setup

### 1. Environment Variables
File `.env.local` sudah ada dengan:
```
VITE_API_URL=http://localhost:4000/api
```

### 2. Start Frontend Development
Terminal 2:
```bash
npm run dev
```

Expected output:
```
  VITE v5.4.10  ready in 123 ms

  ➜  Local:   http://localhost:5173/
```

## Testing Integration

### 1. Login Page
- Navigate to http://localhost:5173/agent/login
- Login dengan:
  - **Email**: superadmin@primeproperty.id
  - **Password**: Superadmin123!

### 2. Properties Page (Dashboard)
- After login, go to /agent/dashboard
- Lihat listing properties dari database
- Test filters (status, type, kawasan, dll)
- Superadmin bisa tambah/edit/hapus property

### 3. Admin Management (Superadmin Only)
- Klik "Kelola Admin" button
- Create new admin dengan form
- Toggle admin status

### 4. Audit Log (Superadmin Only)
- Klik "Audit Log" button
- Lihat semua activity logs
- Masing-masing action terekam dengan details

### 5. Logout
- Logout akan clear session cookie
- Redirect ke login page

## API Endpoints (Sudah Integrated)

### Auth
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user info

### Properties
- `GET /api/properties` - List with filters
- `GET /api/properties/:id` - Detail
- `POST /api/properties` - Create (superadmin)
- `PUT /api/properties/:id` - Update (superadmin)
- `DELETE /api/properties/:id` - Delete (superadmin)

### Admins
- `GET /api/admins` - List admins (superadmin)
- `POST /api/admins` - Create admin (superadmin)
- `PATCH /api/admins/:id/toggle-active` - Toggle status (superadmin)

### Audit Log
- `GET /api/audit-log` - List logs (superadmin)

## Troubleshooting

### Database Connection Error
```
Error: P1001: Can't reach database server at `localhost:5432`
```
**Solution**: Start PostgreSQL service
- Linux: `sudo service postgresql start`
- macOS: `brew services start postgresql@15`
- Docker: `docker start prime-pg`

### Port Already in Use
```
Error: listen EADDRINUSE :::4000
```
**Solution**: Kill process di port 4000
```bash
lsof -i :4000
kill -9 <PID>
```

### Module Not Found
Jika masih ada error module:
```bash
npm install --legacy-peer-deps
npm run prisma:generate
```

### Cookies Not Working
- Make sure backend CORS allows credentials
- Check `credentials: 'include'` di api.js
- Browser console: check Application > Cookies

## File Structure Updates

```
prime/
├── src/
│   ├── App.jsx          (Updated - all components integrated)
│   ├── api.js           (NEW - API client)
│   ├── data.js          (Old mock data - can be removed)
│   ├── main.jsx
│   ├── styles.css
│   └── ...
├── server/              (Backend running on :4000)
├── prisma/
│   ├── schema.prisma
│   └── seed.js          (Run with npm run prisma:seed)
├── .env                 (NEW - Backend config)
├── .env.local           (Frontend config)
└── ...
```

## Next: Run Full Stack

```bash
# Terminal 1: Backend
npm run dev:server

# Terminal 2: Frontend  
npm run dev

# Terminal 3 (Optional): Watch mode
npm run prisma:generate
```

Then open http://localhost:5173/agent/login

## Production Notes

Sebelum deploy:
1. Update `.env` dengan production DATABASE_URL
2. Change SESSION_SECRET ke random string panjang
3. Set NODE_ENV=production
4. Update FRONTEND_ORIGIN ke domain Anda
5. Enable HTTPS dan set secure cookies
6. Setup backup strategy untuk database

## Common Commands

```bash
# Backend
npm run dev:server          # Start with watch
npm run prisma:migrate      # Run migrations
npm run prisma:seed         # Seed database
npm run prisma:generate     # Generate Prisma client

# Frontend
npm run dev                 # Start dev server
npm run build               # Build for production
npm run preview             # Preview production build

# Both
npm run dev:full            # Run both (jika concurrently installed)
```

## Support

Jika ada error, check:
1. Logs di terminal
2. Browser console (F12)
3. Network tab untuk API calls
4. Database connection string di .env
