# Frontend to Backend API Integration Guide

## Perubahan yang Sudah Dilakukan

### 1. API Client Utility (`src/api.js`)
- Membuat API client helper dengan fetch wrapper
- Implementasi cookie-based authentication (credentials: 'include')
- Error handling dengan custom ApiError class
- Grouping API endpoints: authApi, propertiesApi, adminsApi, auditApi

### 2. Login Integration
- Update AgentLogin component untuk menggunakan `authApi.login()`
- Store auth token di localStorage (dari response API)
- Handle loading states dan error messages
- Cookie-based session handling automatic via fetch credentials

### 3. Properties Listing (Dashboard)
- Fetch properties dari API dengan filter support
- Real-time pagination dari server
- Filter dikirim ke backend (bukan frontend processing)
- Dynamic kawasan dan hadap options dari data API
- Proper loading dan error states

### 4. Property Detail & CRUD
- PropertyDetail: Fetch detail dari API
- PropertyForm: Create dan Edit dengan full form fields
- Support untuk hadap dan kawasan sebagai array (checkboxes)
- Delete functionality dengan API call
- Proper error handling dan loading states

### 5. Admin Management
- AdminSettings: Fetch admin list dari API
- Create admin dengan name, email, password
- Toggle active status per admin
- List display dengan status indicators

### 6. Audit Log
- AuditLogPage: Fetch audit logs dari API dengan pagination
- Display: timestamp, user, action, entity type
- Expandable details untuk melihat changes

### 7. Layout & Navigation
- AgentLayout: Update logout untuk API call
- ProtectedRoute: Verify auth dengan `/api/auth/me`
- Proper auth state management

## Testing Flow

### 1. Login
```
Email: superadmin@primeproperty.id
Password: Superadmin123!
```
Atau:
```
Email: admin@primeproperty.id
Password: Admin12345!
```

### 2. Properties
- Superadmin bisa create, edit, delete properties
- Admin dan superadmin bisa view properties
- Filter dan search bekerja via API

### 3. Admin Management (Superadmin Only)
- View list admin
- Create new admin
- Toggle active status

### 4. Audit Log (Superadmin Only)
- View all audit logs
- Pagination support

## Environment Setup

### Development
```bash
# Terminal 1: Backend
npm run dev:server

# Terminal 2: Frontend
npm run dev

# Terminal 3: Prisma (if needed)
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

### Frontend .env.local
```
VITE_API_URL=http://localhost:4000/api
```

## API Endpoints Diintegrasikan

### Auth
- POST `/api/auth/login` - Login dengan email/password
- POST `/api/auth/logout` - Logout (clear session)
- GET `/api/auth/me` - Get current user

### Properties
- GET `/api/properties` - List dengan filter/pagination
- GET `/api/properties/:id` - Detail properti
- POST `/api/properties` - Create (superadmin only)
- PUT `/api/properties/:id` - Update (superadmin only)
- DELETE `/api/properties/:id` - Delete (superadmin only)

### Admins
- GET `/api/admins` - List admin (superadmin only)
- POST `/api/admins` - Create admin (superadmin only)
- PATCH `/api/admins/:id/toggle-active` - Toggle status (superadmin only)

### Audit Log
- GET `/api/audit-log` - List dengan pagination (superadmin only)

## Data Format Notes

### Properties
- Database field: namaProperty, tapi form input: nama_property
- Price: stored as BigInt, dikirim/terima sebagai string di JSON
- Hadap dan kawasan: array of strings
- Carport: boolean
- Status: in_stock | sold_out
- Siap: siap_huni | siap_kosong | siap_huni_renovasi

### Users
- Role: admin | superadmin
- isActive: boolean (untuk enable/disable admin)
- Password di-hash dengan bcrypt di backend

## Status Backend Checks

1. Database setup? `npm run prisma:migrate`
2. Seed data created? `npm run prisma:seed`
3. Server running on :4000? `npm run dev:server`
4. CORS configured? Included in server/index.js
5. Cookies enabled? Session via httpOnly cookies

## Next Steps/Improvements

1. Add form validation (use Zod like backend)
2. Add image upload for properties
3. Add search history/filters
4. Add export audit logs
5. Add rate limiting on frontend
6. Add offline support (service worker)
7. Add refresh token rotation
