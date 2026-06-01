# PRD — Prime Property Web Platform & Internal Agent Portal

**Versi:** 1.0  
**Tanggal:** 24 Mei 2026  
**Bahasa:** Indonesia  
**Status:** Final Draft — Siap Implementasi

---

## Daftar Isi

1. [Overview & Tujuan Produk](#1-overview--tujuan-produk)
2. [Tech Stack & Arsitektur](#2-tech-stack--arsitektur)
3. [Design System & Branding](#3-design-system--branding)
4. [Struktur Routing & Halaman](#4-struktur-routing--halaman)
5. [Halaman Publik — Landing Page](#5-halaman-publik--landing-page)
6. [Halaman Publik — About Us](#6-halaman-publik--about-us)
7. [Halaman Publik — Contact Us](#7-halaman-publik--contact-us)
8. [Autentikasi Internal Agent](#8-autentikasi-internal-agent)
9. [Role & Authorization System](#9-role--authorization-system)
10. [Schema Database — Properti](#10-schema-database--properti)
11. [Dashboard Internal — View & Filter Properti](#11-dashboard-internal--view--filter-properti)
12. [Dashboard Internal — CRUD Properti (Superadmin)](#12-dashboard-internal--crud-properti-superadmin)
13. [Manajemen Akun Admin (Superadmin)](#13-manajemen-akun-admin-superadmin)
14. [Audit Log](#14-audit-log)
15. [Non-Functional Requirements](#15-non-functional-requirements)
16. [Definition of Done](#16-definition-of-done)
17. [Out of Scope (Phase 2)](#17-out-of-scope-phase-2)

---

## 1. Overview & Tujuan Produk

### 1.1 Latar Belakang

Prime Property membutuhkan dua produk digital yang saling terintegrasi:

1. **Web Platform Publik** — Halaman pemasaran untuk calon pembeli/penyewa properti (Landing, About, Contact).
2. **Internal Agent Portal** — Dashboard privat untuk agen internal dalam mengelola dan memantau listing properti dengan role-based access control (RBAC).

### 1.2 Target Pengguna

| Pengguna | Deskripsi | Akses |
|---|---|---|
| Pengunjung Umum | Calon pembeli/penyewa properti | Halaman publik saja |
| Admin | Agen internal Prime Property | View & search listing |
| Superadmin | Manajer / pemilik sistem | Full CRUD + kelola akun admin |

### 1.3 Problem Statement

- Tim internal tidak memiliki sistem terpusat untuk inventarisasi properti.
- Data properti masih tersebar (spreadsheet, catatan manual).
- Tidak ada kontrol akses yang jelas antara staff yang bisa edit data dan yang hanya bisa melihat.

### 1.4 Success Metrics

- Semua acceptance criteria terpenuhi dan lulus QA.
- Zero bug Priority High/Critical saat launch.
- Lighthouse Performance Score ≥ 85 di halaman Landing Page.
- Filter & search response < 500ms untuk dataset 1.000 properti.

---

## 2. Tech Stack & Arsitektur

> Catatan: Stack di bawah adalah **rekomendasi referensi**. Tim development dapat menyesuaikan selama semua acceptance criteria terpenuhi.

### 2.1 Frontend

- **Framework:** Next.js (App Router) atau React + Vite
- **Styling:** Tailwind CSS
- **Font:** Inter atau Geist (Google Fonts / Next/font)
- **State Management:** Zustand atau React Context (untuk filter state)
- **Form Validation:** React Hook Form + Zod
- **Notifikasi/Toast:** React Hot Toast atau Sonner

### 2.2 Backend

- **Runtime:** Node.js (Next.js API Routes) atau Express/Fastify
- **ORM:** Prisma
- **Database:** PostgreSQL
- **Auth Session:** Cookie-based (`httpOnly`, `SameSite=Lax`)
- **Password Hashing:** bcrypt (cost factor ≥ 10)
- **Email:** Nodemailer / Resend / SendGrid (untuk form kontak)
- **Rate Limiting:** `express-rate-limit` atau middleware custom

### 2.3 Infrastruktur

- **Deployment:** Vercel, Railway, atau VPS
- **HTTPS:** Wajib di production (SSL/TLS)
- **Environment Variables:** Semua secret disimpan di `.env` (tidak di-commit ke repo)

### 2.4 Arsitektur Routing

```
/ (root)                    → Landing Page (publik)
/about                      → About Us (publik)
/contact                    → Contact Us (publik)
/agent/login                → Login Agent (privat, tidak ada link dari nav publik)
/agent/dashboard            → Dashboard listing (Admin & Superadmin)
/agent/properties/[id]      → Detail properti
/agent/properties/new       → Form tambah properti (Superadmin only)
/agent/properties/[id]/edit → Form edit properti (Superadmin only)
/agent/settings/admins      → Kelola akun admin (Superadmin only)
/agent/audit-log            → Audit log (Superadmin only)
```

---

## 3. Design System & Branding

### 3.1 Color Palette

| Token | Hex | Penggunaan |
|---|---|---|
| `--color-primary` | `#1A1A1A` | Header, teks utama, background hero |
| `--color-accent-gold` | `#C9A961` | CTA button, highlight, badge premium, border aktif |
| `--color-accent-red` | `#B33A3A` | Status urgent, hover state, error inline, badge Sold Out |
| `--color-white` | `#FFFFFF` | Background utama halaman |
| `--color-gray-soft` | `#F5F5F5` | Background card, secondary section, tabel row alt |

**Aturan wajib:**
- Seluruh halaman (publik & internal) WAJIB menggunakan palette di atas secara konsisten.
- Tidak boleh menggunakan warna di luar palette tanpa persetujuan.

### 3.2 Typography

- **Font Family:** `Inter` atau `Geist` — sans-serif modern, bersih, dan mudah dibaca.
- **Heading:** `font-weight: 700` (Bold)
- **Body / Label:** `font-weight: 400` (Regular)
- **Skala ukuran:**

```
h1: 40–48px (hero tagline)
h2: 28–32px (section heading)
h3: 20–24px (sub-heading, card title)
body: 14–16px
label/caption: 12px
```

### 3.3 Logo

- Logo Prime Property **WAJIB** tampil di:
  - Header semua halaman publik (Landing, About, Contact)
  - Header dashboard internal
- Logo harus terlihat menonjol pada background gelap (`#1A1A1A`).
- Tidak boleh dipotong, di-stretch, atau diubah warnanya.

### 3.4 Layout & Spacing

- **Grid system:** 4 / 8 / 16 / 24 / 32 px
- **Breakpoint:**
  - Mobile: ≤ 640px → single column
  - Tablet: ≤ 1024px → 2 kolom / grid adaptif
  - Desktop: ≥ 1024px → layout penuh
- **Prinsip:** Compact, clear, mobile-responsive.
- **Tidak ada fitur upload gambar** untuk listing properti — fokus pada data tabular.

### 3.5 Komponen UI Berulang

| Komponen | Spesifikasi |
|---|---|
| Button Primary (CTA) | Background `#C9A961`, teks `#1A1A1A`, border-radius 4–6px |
| Button Outline | Border `#C9A961`, teks `#C9A961`, background transparan |
| Button Danger | Background `#B33A3A`, teks putih |
| Badge In Stock | Background hijau muda (`#D1FAE5`), teks hijau gelap |
| Badge Sold Out | Background `#B33A3A`, teks putih |
| Badge Siap Huni | Background kuning/emas muda, teks gelap |
| Badge Siap Kosong | Background ungu muda, teks ungu gelap |
| Toast Success | Hijau, muncul di pojok kanan atas, auto-dismiss 4 detik |
| Toast Error | Merah, muncul di pojok kanan atas, auto-dismiss 5 detik |
| Modal Konfirmasi | Overlay gelap, card putih di tengah, tombol Batal + Konfirmasi |
| Chip Filter Aktif | Background `#C9A961` muda, teks gelap, ada tombol × untuk remove |

---

## 4. Struktur Routing & Halaman

### 4.1 Navigation Header — Halaman Publik

- **Sticky** di semua scroll position.
- Background: `#1A1A1A`
- Urutan menu (kiri → kanan):

```
[Logo Prime Property] | Beranda | Tentang Kami | Kontak | [Login Agent]
```

- Tombol **"Login Agent"**: style outline emas (`border: #C9A961`, teks: `#C9A961`).
- Link **"Login Agent"** mengarah ke `/agent/login`.
- Tidak ada teks "Login Agent" di navigasi publik yang langsung terlihat sebagai link utama — cukup tombol outline di kanan.

### 4.2 Navigation Header — Dashboard Internal

- Logo Prime Property di kiri.
- Di kanan: nama user yang login + **dropdown profil** berisi tombol **"Logout"**.
- Sidebar (opsional) atau top nav untuk menu: Listing Properti | Kelola Admin (Superadmin) | Audit Log (Superadmin).

---

## 5. Halaman Publik — Landing Page

### 5.1 Hero Section

**Layout:**
- Background penuh `#1A1A1A`.
- Logo Prime Property prominent (center atau kiri atas).
- Tagline utama: heading besar, warna putih atau emas.
- Contoh tagline: *"Properti Terbaik untuk Kehidupan Terbaik Anda"* (tim marketing menentukan final copy).
- **1 CTA Primer:** tombol emas (`#C9A961`) dengan teks hitam.
  - Contoh label: "Lihat Properti" → scroll ke section Properti Unggulan, atau "Hubungi Kami" → link ke `/contact`.

**Acceptance Criteria:**
- [ ] Background hero wajib `#1A1A1A`.
- [ ] Logo terlihat jelas dan tidak terpotong.
- [ ] CTA button warna `#C9A961` dengan teks `#1A1A1A`.
- [ ] 1 CTA primer (tidak lebih dari 1 tombol utama di hero).

### 5.2 Section Properti Unggulan

**Deskripsi:** Menampilkan maksimum **6 properti** dalam format card read-only. Data diambil dari database (properti yang dipilih/ditandai sebagai "unggulan" oleh superadmin, atau 6 listing terbaru yang `status = in_stock`).

**Isi Card Properti:**
- Nama Properti
- Tipe (Ruko / Villa)
- Lebar × Panjang (m)
- Harga (format: `Rp 1.350.000.000`)
- Status badge (In Stock / Sold Out)
- Kawasan

**Aturan:**
- Read-only — tidak ada filter, tidak ada CRUD di halaman publik.
- Maksimum 6 card.
- Jika properti `status = sold_out`, tetap tampil tapi badge merah.

**Acceptance Criteria:**
- [ ] Maksimum 6 properti tampil.
- [ ] Format harga menggunakan separator titik (.) sesuai locale Indonesia.
- [ ] Card tidak bisa diklik untuk edit (read-only).

### 5.3 Section Mengapa Prime Property

**Deskripsi:** 3–4 value proposition.

**Isi per item:**
- Ikon (SVG atau icon library)
- Judul singkat (contoh: "Lokasi Strategis", "Harga Transparan")
- Deskripsi 1–2 kalimat

**Layout:** Grid 3 atau 4 kolom di desktop, single column di mobile.

### 5.4 Footer

**Isi:**
- Logo Prime Property
- Kontak singkat: nomor telepon, link WhatsApp (`wa.me/...`), email
- Link navigasi: About Us | Contact Us
- Copyright: © 2026 Prime Property

**Acceptance Criteria:**
- [ ] Footer tampil di semua halaman publik.
- [ ] Link WhatsApp menggunakan format `https://wa.me/[nomor]` (tanpa tanda +/0 di depan sesuai format wa.me).
- [ ] Logo tampil di footer.

---

## 6. Halaman Publik — About Us

### 6.1 Konten

Seluruh konten dalam **Bahasa Indonesia**. Isi:

1. **Profil Perusahaan** — Deskripsi singkat Prime Property (sejarah, fokus bisnis).
2. **Visi & Misi** — Visi 1 kalimat, Misi 3–5 poin.
3. **Nilai Perusahaan** — 3–4 nilai inti dengan deskripsi singkat.

### 6.2 Layout

- **Desktop:** 2 kolom — kolom kiri teks utama, kolom kanan visual/quote/highlight.
- **Mobile:** Single column.
- Tidak ada elemen interaktif kompleks selain navigasi standar.

**Acceptance Criteria:**
- [ ] Seluruh konten dalam Bahasa Indonesia.
- [ ] Layout 2 kolom di desktop, 1 kolom di mobile.
- [ ] Tidak ada form, login, atau elemen interaktif di halaman ini.

---

## 7. Halaman Publik — Contact Us

### 7.1 Informasi Kontak

Tampilkan:
- **Alamat kantor** (teks lengkap)
- **Nomor telepon** (dapat diklik untuk call di mobile)
- **Email** (mailto link)
- **Link WhatsApp** — tombol/link dengan format `https://wa.me/[nomor]`
- **Google Maps Embed** (opsional — hanya jika koordinat kantor tersedia)

### 7.2 Form Kontak

**Fields:**

| Field | Tipe | Validasi |
|---|---|---|
| Nama | Text input | Wajib diisi, min 2 karakter |
| Email | Email input | Wajib, format email valid |
| Nomor HP | Tel input | Wajib, minimum 10 digit angka |
| Pesan | Textarea | Wajib diisi, min 10 karakter |

**Perilaku Submit:**
- Validasi client-side (instant feedback sebelum submit).
- Validasi server-side (keamanan).
- Jika sukses: tampilkan toast `"Pesan terkirim, tim kami akan menghubungi Anda."` dan reset form.
- Jika gagal: tampilkan error inline di bawah field yang bermasalah, warna `#B33A3A`.
- Submit mengirim **email notifikasi ke admin Prime Property** (konfigurasi email address di environment variable).

**Anti-Spam:**
- Rate limit: **3 submit per IP per jam**.
- Jika melebihi limit: response HTTP 429, tampilkan pesan "Terlalu banyak percobaan. Coba lagi dalam 1 jam."

**Acceptance Criteria:**
- [ ] Semua 4 field wajib diisi sebelum submit bisa diproses.
- [ ] Validasi email format (harus mengandung @ dan domain valid).
- [ ] Nomor HP minimum 10 digit.
- [ ] Toast sukses muncul setelah submit berhasil.
- [ ] Form di-reset setelah submit sukses.
- [ ] Rate limit 3x/jam/IP berjalan di backend.
- [ ] Email notifikasi terkirim ke alamat admin yang dikonfigurasi.

---

## 8. Autentikasi Internal Agent

### 8.1 Halaman Login — `/agent/login`

**Ketentuan:**
- Route **terpisah** dan **tidak ada link dari navigasi publik** (URL harus diketik langsung atau via tombol "Login Agent" di header).
- Tampilan sederhana, branded (logo Prime Property + form).
- **Tidak ada self-registration** — akun dibuat manual oleh superadmin.

**Fields:**
- Email (input type email)
- Password (input type password, dengan toggle show/hide)

**Atau** (sesuai keputusan implementasi): Email + OTP 6 digit via email.

**Perilaku:**
- Jika kredensial valid: buat session, set cookie `httpOnly; SameSite=Lax; Max-Age=30 hari (2.592.000 detik)`, redirect ke `/agent/dashboard`.
- Jika kredensial salah: tampilkan error `"Email atau password salah."` (jangan bedakan mana yang salah — security best practice).
- **Lockout:** Setelah **5x gagal login dalam 30 menit**, akun di-lockout selama **15 menit**.
  - Tampilkan pesan: `"Akun dikunci sementara karena terlalu banyak percobaan gagal. Coba lagi dalam [X] menit."`
  - Counter reset setelah lockout berakhir.

**Security:**
- Cookie: `httpOnly = true`, `SameSite = Lax`, `Secure = true` (production HTTPS).
- Masa berlaku session: 30 hari.
- Endpoint login dilindungi rate limit: 10 req/menit/IP.

**Acceptance Criteria:**
- [ ] Route `/agent/login` tidak bisa diakses tanpa langsung mengetik URL (tidak ada link dari nav publik selain tombol "Login Agent" di header).
- [ ] Session disimpan di httpOnly cookie.
- [ ] Lockout aktif setelah 5x gagal dalam 30 menit.
- [ ] Password tidak tersimpan plaintext — di-hash dengan bcrypt cost factor ≥ 10.
- [ ] Redirect ke dashboard setelah login sukses.

### 8.2 Protected Routes

- Semua route `/agent/*` (kecuali `/agent/login`) **WAJIB** dilindungi middleware autentikasi.
- Jika user belum login atau session expired, redirect ke `/agent/login`.
- Middleware berjalan di **server-side** (bukan hanya frontend check).

### 8.3 Logout

- Tombol Logout tersedia di **header dashboard internal** → dropdown profil.
- Logout: hapus/invalidate session cookie + redirect ke `/agent/login`.
- Server-side: session dihapus dari store (jika menggunakan server session) atau cookie di-clear.

---

## 9. Role & Authorization System

### 9.1 Dua Role Sistem

#### 👤 Role: Admin

| Permission | Status |
|---|---|
| View daftar listing properti | ✅ Boleh |
| Filter & search properti | ✅ Boleh |
| Lihat detail properti | ✅ Boleh |
| Create properti baru | ❌ Tidak boleh |
| Update / edit properti | ❌ Tidak boleh |
| Delete properti | ❌ Tidak boleh |
| Kelola akun admin | ❌ Tidak boleh |
| Lihat audit log | ❌ Tidak boleh |

#### 👑 Role: Superadmin

| Permission | Status |
|---|---|
| Semua yang Admin bisa | ✅ |
| Create properti baru | ✅ Boleh |
| Update / edit properti | ✅ Boleh |
| Delete properti (soft delete) | ✅ Boleh |
| Create akun admin baru | ✅ Boleh |
| Disable / enable akun admin | ✅ Boleh |
| Reset password admin | ✅ Boleh |
| Lihat audit log perubahan | ✅ Boleh |

### 9.2 Enforcement Authorization

**CRITICAL — Dual Layer Authorization:**

1. **Frontend layer:** Sembunyikan/nonaktifkan tombol dan UI element yang tidak relevan dengan role user (tombol "Edit", "Hapus", "+ Tambah Properti" tidak tampil untuk Admin).
2. **Backend layer:** Setiap endpoint mutasi (POST/PUT/PATCH/DELETE) WAJIB dicek di server-side middleware authorization.
   - Jika Admin mencoba akses endpoint mutasi: response **`403 Forbidden`**
   - Frontend hide UI bukan satu-satunya gate — backend harus tetap enforce.

**Contoh implementasi middleware:**
```javascript
// Middleware: requireSuperadmin
function requireSuperadmin(req, res, next) {
  if (!req.user || req.user.role !== 'superadmin') {
    return res.status(403).json({ error: 'Forbidden: Superadmin access required' });
  }
  next();
}

// Diaplikasikan ke semua endpoint mutasi properti:
router.post('/properties', requireSuperadmin, createProperty);
router.put('/properties/:id', requireSuperadmin, updateProperty);
router.delete('/properties/:id', requireSuperadmin, deleteProperty);
```

**Acceptance Criteria:**
- [ ] Admin tidak melihat tombol Edit/Hapus/Tambah Properti di UI.
- [ ] Admin yang mencoba hit endpoint POST/PUT/DELETE properti via API tool menerima 403.
- [ ] Superadmin bisa akses semua fitur.
- [ ] Role disimpan di database dan dicek dari session saat setiap request.

---

## 10. Schema Database — Properti

### 10.1 Tabel `properties`

| Field | Tipe | Nullable | Keterangan |
|---|---|---|---|
| `id` | UUID / BIGINT (PK) | ❌ | Auto-generate |
| `nama_property` | VARCHAR(100) | ❌ | Min 3, max 100 karakter |
| `group` | VARCHAR(100) | ✅ | Contoh: "Mentari", "Permai 123" |
| `lebar` | DECIMAL(5,2) | ❌ | Meter, > 0, max 2 desimal |
| `panjang` | DECIMAL(5,2) | ❌ | Meter, > 0, max 2 desimal |
| `hadap` | TEXT[] / JSON | ❌ | Array: ['Utara', 'Barat'] dst. |
| `tipe` | ENUM('ruko', 'villa') | ❌ | |
| `tingkat` | DECIMAL(3,1) | ❌ | Range 1–10, max 1 desimal |
| `price` | BIGINT | ❌ | Rupiah penuh, integer, > 0 |
| `carport` | BOOLEAN | ❌ | true / false |
| `status` | ENUM('in_stock', 'sold_out') | ❌ | |
| `siap` | ENUM('siap_huni', 'siap_kosong', 'siap_huni_renovasi') | ❌ | |
| `maps_link` | TEXT | ✅ | URL valid, domain google.com/maps |
| `kawasan` | TEXT[] / JSON | ❌ | Multi-tag, contoh: ['Krakatau', 'Pancing'] |
| `unit` | TEXT | ✅ | Contoh: "Ready Siap huni", "Gate siap" |
| `created_at` | TIMESTAMP WITH TZ | ❌ | Auto-generate saat INSERT |
| `updated_at` | TIMESTAMP WITH TZ | ❌ | Auto-update saat UPDATE |
| `created_by` | FK → users.id | ❌ | Superadmin yang membuat entry |
| `deleted_at` | TIMESTAMP WITH TZ | ✅ | NULL = aktif; terisi = soft-deleted |

**Catatan penting:**
- `price` **WAJIB** disimpan sebagai integer rupiah (BIGINT), **bukan float/decimal** — untuk menghindari error pembulatan.
- Format display: `Rp 1.350.000.000` (titik sebagai separator ribuan, locale Indonesia).
- `hadap` dan `kawasan` adalah multi-value — gunakan array (PostgreSQL `TEXT[]`) atau JSON.
- Properti dengan `deleted_at IS NOT NULL` tidak tampil di listing publik maupun internal default view.

### 10.2 Tabel `users`

| Field | Tipe | Nullable | Keterangan |
|---|---|---|---|
| `id` | UUID / BIGINT (PK) | ❌ | Auto-generate |
| `name` | VARCHAR(100) | ❌ | Nama lengkap |
| `email` | VARCHAR(255) UNIQUE | ❌ | Email login |
| `password_hash` | VARCHAR(255) | ❌ | bcrypt hash |
| `role` | ENUM('admin', 'superadmin') | ❌ | |
| `is_active` | BOOLEAN | ❌ | Default true; false = disabled |
| `failed_login_count` | INT | ❌ | Default 0 |
| `lockout_until` | TIMESTAMP WITH TZ | ✅ | NULL = tidak lockout |
| `created_at` | TIMESTAMP WITH TZ | ❌ | |
| `updated_at` | TIMESTAMP WITH TZ | ❌ | |
| `created_by` | FK → users.id | ✅ | Superadmin yang membuat akun ini |

### 10.3 Tabel `audit_logs`

| Field | Tipe | Keterangan |
|---|---|---|
| `id` | BIGINT (PK) | Auto-increment |
| `user_id` | FK → users.id | Siapa yang melakukan aksi |
| `action` | VARCHAR(50) | 'create', 'update', 'delete', 'restore' |
| `entity_type` | VARCHAR(50) | 'property', 'user' |
| `entity_id` | VARCHAR(50) | ID entitas yang diubah |
| `changes` | JSONB | `{ before: {...}, after: {...} }` |
| `ip_address` | VARCHAR(45) | IP client |
| `created_at` | TIMESTAMP WITH TZ | Waktu aksi |

---

## 11. Dashboard Internal — View & Filter Properti

### 11.1 Halaman Listing (Tabel Properti)

**Default View:**
- Tabel kompak menampilkan **semua properti** yang `deleted_at IS NULL`.
- Kolom default:

```
No. | Nama Properti | Group | Lebar × Panjang | Hadap | Tipe | Tingkat | Harga | Carport | Status | Siap | Kawasan
```

**Pagination:**
- Pilihan baris per halaman: **25 / 50 / 100** (default: 50)
- Tampilkan total jumlah properti dan range yang sedang ditampilkan: `Menampilkan 1–50 dari 127 properti`

**Sorting:**
- Klik header kolom untuk sort (asc/desc toggle)
- Sort yang tersedia: Nama, Harga, Tanggal Dibuat, Status

**Badge Status:**

| Status | Tampilan |
|---|---|
| `in_stock` | Badge hijau muda (`#D1FAE5`, teks hijau gelap) |
| `sold_out` | Badge merah (`#B33A3A`, teks putih) |
| `siap_huni` | Badge kuning/emas muda, teks gelap |
| `siap_kosong` | Badge ungu muda, teks ungu gelap |
| `siap_huni_renovasi` | Badge oranye muda, teks oranye gelap |

**Aksi per baris:**
- Klik baris → buka **drawer panel di samping** (preferred) atau navigasi ke halaman detail terpisah `/agent/properties/[id]`.

### 11.2 Filter & Pencarian

**Search Bar:**
- Free-text di atas tabel.
- Mencari ke field: `nama_property`, `group`, `kawasan`.
- Debounce 300ms sebelum trigger search.
- Placeholder: `"Cari nama properti, grup, atau kawasan..."`

**Panel Filter (Sidebar atau collapsible):**

| Filter | Tipe Input | Opsi |
|---|---|---|
| Kawasan | Dropdown multi-select | Krakatau, Pancing, Tembung, Helvetia, Cemara Asri/Kuala, dll. (dari data existing) |
| Lebar Minimum (m) | Input numeric | Angka desimal, ≥ 0 |
| Hadap | Multi-select checkbox | Utara, Selatan, Timur, Barat |
| Harga Maksimum | Input numeric (format Rupiah) | Slider opsional |
| Tipe Properti | Radio button | Semua / Ruko / Villa |
| Status | Radio button | Semua / In Stock / Sold Out |
| Kondisi Siap | Multi-select checkbox | Siap Huni, Siap Kosong, Siap Huni Renovasi |
| Carport | Toggle | Semua / Ya / Tidak |

**Perilaku Filter:**
- Filter di-apply **real-time** dengan debounce 300ms (tidak perlu tombol "Apply").
- Filter aktif ditampilkan sebagai **chip** di atas tabel (contoh: `× Kawasan: Krakatau`).
- Chip bisa di-remove individual (klik ×).
- Tombol **"Reset Filter"** mengembalikan semua filter ke default.
- State filter **disimpan di URL query params** (shareable link).
  - Contoh: `/agent/dashboard?kawasan=Krakatau&status=in_stock&tipe=ruko`

**Acceptance Criteria:**
- [ ] Search bar berfungsi dan mencari ke 3 field yang disebutkan.
- [ ] Semua 8 filter berfungsi.
- [ ] Filter aktif tampil sebagai chip yang bisa di-remove.
- [ ] Reset Filter mengembalikan ke state awal (semua properti, tanpa filter).
- [ ] URL update saat filter aktif.
- [ ] Response filter < 500ms untuk 1.000 properti.

### 11.3 Halaman Detail Properti

**URL:** `/agent/properties/[id]`

**Layout:**
- 2 kolom di desktop, 1 kolom di mobile.
- Tampilkan **seluruh field** dari schema AC-6.1.
- Format harga: `Rp 1.350.000.000`
- Format tanggal: `24 Mei 2026` atau `24/05/2026`
- Timezone: Asia/Jakarta (WIB)

**Tombol Maps:**
- Jika `maps_link` terisi → tampilkan tombol **"Buka di Google Maps"** yang open new tab.

**Tombol Aksi (conditional by role):**

| Role | Tombol Tampil |
|---|---|
| Admin | Tidak ada tombol Edit / Hapus |
| Superadmin | Tombol "Edit" (emas) + "Hapus" (merah) di pojok kanan atas |

---

## 12. Dashboard Internal — CRUD Properti (Superadmin)

### 12.1 Create Properti Baru

**Akses:**
- Tombol **"+ Tambah Properti"** hanya tampil di halaman listing untuk role Superadmin.
- Navigasi ke form di `/agent/properties/new`.

**Form Layout:**
- Grid 2 kolom di desktop, single column di mobile.
- Label di atas setiap field.
- Required fields ditandai dengan asterisk `*`.

**Semua Field Form (sesuai schema):**

| Field | Input Type | Validasi |
|---|---|---|
| Nama Properti * | Text input | Min 3, max 100 karakter |
| Group | Text input | Opsional |
| Lebar (m) * | Number input, step 0.01 | > 0, max 2 desimal |
| Panjang (m) * | Number input, step 0.01 | > 0, max 2 desimal |
| Hadap * | Multi-select checkbox | Min 1 pilihan: Utara/Selatan/Timur/Barat |
| Tipe * | Radio / Select | Ruko / Villa |
| Tingkat * | Number input, step 0.5 | 1–10, max 1 desimal |
| Harga (Rp) * | Number input | > 0, integer, format display Rupiah |
| Carport * | Toggle / Checkbox | Ya / Tidak |
| Status * | Select | In Stock / Sold Out |
| Kondisi Siap * | Select | Siap Huni / Siap Kosong / Siap Huni Renovasi |
| Link Google Maps | URL input | Opsional; jika diisi harus URL valid dengan domain `google.com/maps` |
| Kawasan * | Multi-select / Tag input | Min 1 kawasan |
| Unit | Text input | Opsional |

**Behavior Submit:**
- Validasi client-side (instant feedback saat user meninggalkan field / on-blur + on-submit).
- Validasi server-side (security layer).
- Jika sukses: toast "Properti berhasil ditambahkan!" + redirect ke halaman listing, baris properti baru di-highlight sebentar.
- Jika gagal: error inline di bawah field bermasalah, warna `#B33A3A`.

**Tombol Opsional:** "Simpan & Tambah Lagi" — setelah save, form di-reset untuk input properti berikutnya tanpa redirect.

**Acceptance Criteria:**
- [ ] Form hanya bisa diakses Superadmin.
- [ ] Semua validasi berjalan di client dan server.
- [ ] `created_by` auto-set dari session user yang sedang login.
- [ ] `created_at` dan `updated_at` auto-generate.
- [ ] Toast sukses dan highlight baris baru di listing.

### 12.2 Update / Edit Properti

**Akses:**
- Tombol "Edit" di halaman detail properti (Superadmin only).
- Navigasi ke `/agent/properties/[id]/edit`.

**Form:**
- Layout sama dengan form Create.
- Semua field **ter-prefill** dengan data properti yang ada.

**Dirty State Indicator:**
- Field yang sudah diubah ditandai secara visual (border berwarna atau dot indicator).

**Tombol:**
- **"Simpan Perubahan"** — submit form.
- **"Batal"** — kembali ke halaman detail tanpa menyimpan.

**Audit:**
- Setiap perubahan dicatat di tabel `audit_logs`:
  ```json
  {
    "user_id": "...",
    "action": "update",
    "entity_type": "property",
    "entity_id": "...",
    "changes": {
      "before": { "price": 1200000000, "status": "in_stock" },
      "after": { "price": 1350000000, "status": "sold_out" }
    }
  }
  ```

**Acceptance Criteria:**
- [ ] Data ter-prefill dengan benar.
- [ ] Dirty state indicator berjalan.
- [ ] Tombol Batal tidak menyimpan perubahan apapun.
- [ ] Perubahan tercatat di audit log.
- [ ] `updated_at` otomatis diperbarui.

### 12.3 Delete Properti

**Akses:**
- Tombol "Hapus" di halaman detail properti (Superadmin only).

**Konfirmasi:**
- Tombol Hapus memunculkan **modal konfirmasi** dengan teks:
  > *"Yakin hapus properti **[nama_property]**? Tindakan ini tidak dapat dibatalkan."*
- Tombol di modal: `[Batal]` (outline) dan `[Hapus]` (merah/danger).

**Implementasi:**
- **Soft delete** — set `deleted_at = NOW()` (bukan DELETE dari database).
- Properti yang `deleted_at IS NOT NULL`:
  - **Tidak muncul** di halaman listing publik.
  - **Tidak muncul** di dashboard internal default view.
- Aksi dicatat di audit log.

**Acceptance Criteria:**
- [ ] Modal konfirmasi muncul sebelum delete dieksekusi.
- [ ] Soft delete (deleted_at terisi, bukan hard delete).
- [ ] Properti hilang dari listing setelah dihapus.
- [ ] Aksi delete tercatat di audit log.

### 12.4 Validasi Form (Ringkasan)

| Field | Aturan Validasi |
|---|---|
| `nama_property` | Min 3 karakter, max 100 karakter, wajib diisi |
| `lebar` | Wajib diisi, harus > 0, max 2 desimal |
| `panjang` | Wajib diisi, harus > 0, max 2 desimal |
| `price` | Wajib diisi, harus > 0, harus integer (tidak boleh decimal) |
| `tingkat` | Wajib diisi, range 1–10, max 1 desimal |
| `maps_link` | Opsional; jika diisi harus URL valid yang mengandung `google.com/maps` |
| `hadap` | Wajib pilih minimal 1 |
| `kawasan` | Wajib pilih/isi minimal 1 |
| `tipe` | Wajib pilih salah satu |
| `status` | Wajib pilih salah satu |
| `siap` | Wajib pilih salah satu |
| `carport` | Wajib pilih (default false) |

**Error Display:** Pesan error tampil **inline di bawah field** yang bermasalah, teks merah `#B33A3A`.

---

## 13. Manajemen Akun Admin (Superadmin)

**Akses:** Menu "Kelola Admin" hanya tampil untuk Superadmin di navigasi dashboard.
**URL:** `/agent/settings/admins`

### 13.1 Daftar Admin

- Tabel menampilkan: Nama, Email, Status (Aktif/Nonaktif), Tanggal Dibuat.
- Tombol aksi per baris: **Disable/Enable**, **Reset Password**.

### 13.2 Buat Akun Admin Baru

- Form: Nama, Email, Password awal.
- Role default: Admin (tidak bisa membuat Superadmin baru via UI — hanya via database langsung).
- Email tidak boleh duplikat.

### 13.3 Disable / Enable Akun

- Toggle status `is_active`.
- Akun yang disabled tidak bisa login (cek `is_active` saat login).
- Konfirmasi modal sebelum disable.

### 13.4 Reset Password Admin

- Superadmin bisa reset password admin lain.
- Generate password sementara yang ditampilkan sekali, atau kirim via email.
- Admin yang password-nya direset harus ganti password saat login pertama (opsional — bisa Phase 2).

---

## 14. Audit Log

**Akses:** Superadmin only. URL: `/agent/audit-log`

### 14.1 View Audit Log

- Tabel dengan kolom: Waktu, User, Aksi, Entitas, Detail Perubahan.
- Sort default: terbaru di atas.
- Filter by: range tanggal, aksi (create/update/delete), user.
- Pagination: 50 per halaman.
- Klik baris → expand detail perubahan (before/after JSON).

### 14.2 Aksi yang Dicatat

| Aksi | Trigger |
|---|---|
| `create` | Properti baru dibuat |
| `update` | Properti diedit |
| `delete` | Properti di-soft-delete |
| `restore` | Properti di-restore dari arsip (Phase 2) |
| `admin_create` | Akun admin baru dibuat |
| `admin_disable` | Akun admin di-disable |
| `admin_enable` | Akun admin di-enable |
| `admin_reset_password` | Password admin direset |

---

## 15. Non-Functional Requirements

### 15.1 Performance

| Metrik | Target |
|---|---|
| Time to First Contentful Paint (FCP) | < 1.5 detik di koneksi 4G |
| Filter & search response time | < 500ms untuk dataset 1.000 properti |
| Lighthouse Performance Score (Landing) | ≥ 85 |
| API response time (general) | < 300ms rata-rata |

**Catatan optimasi:**
- Gunakan database index pada kolom yang sering di-query: `status`, `kawasan`, `tipe`, `price`, `deleted_at`.
- Implementasi query pagination di database (bukan di application layer).
- Gunakan `SELECT` hanya kolom yang diperlukan (hindari `SELECT *` untuk listing).

### 15.2 Security

| Requirement | Detail |
|---|---|
| HTTPS | Wajib di production; redirect HTTP → HTTPS |
| Cookie | `httpOnly=true`, `SameSite=Lax`, `Secure=true` (production) |
| Password hashing | bcrypt, cost factor ≥ 10 |
| CSRF Protection | Token CSRF untuk semua mutasi (POST/PUT/PATCH/DELETE) |
| Rate Limiting Global | 100 req/menit/IP |
| Rate Limiting Auth | 10 req/menit/IP untuk endpoint `/agent/login` |
| Rate Limiting Contact Form | 3 submit/jam/IP |
| Input Sanitization | Prevent XSS dan SQL Injection di semua input |
| Authorization | Server-side check di setiap endpoint (bukan hanya frontend) |
| Session Expiry | 30 hari; invalidate saat logout |

### 15.3 Bahasa & Lokalisasi

| Aspek | Format |
|---|---|
| Bahasa UI | Bahasa Indonesia |
| Format harga | `Rp 1.350.000.000` (titik sebagai separator ribuan) |
| Format tanggal | `24 Mei 2026` atau `24/05/2026` |
| Timezone | Asia/Jakarta (WIB, UTC+7) untuk semua timestamp display |

### 15.4 Browser Support

- Chrome, Edge, Firefox, Safari — **2 versi terakhir**
- Mobile Safari iOS 14+
- Chrome for Android (versi terbaru)

### 15.5 Aksesibilitas (Baseline)

- Semua interactive element bisa diakses via keyboard.
- Form fields punya label yang benar (accessibility, `for` + `id` terhubung).
- Kontras warna teks memenuhi WCAG AA (minimal 4.5:1 untuk body text).
- Alt text untuk semua gambar/logo.

---

## 16. Definition of Done

Sebuah fitur/halaman dinyatakan **DONE** jika **seluruh** kondisi berikut terpenuhi:

1. ✅ Semua acceptance criteria di dokumen ini terpenuhi dan telah diuji (manual/automated).
2. ✅ Tidak ada bug Priority **High** atau **Critical** yang masih terbuka.
3. ✅ UI sesuai brand guidelines: palette `#1A1A1A / #C9A961 / #B33A3A`, typography Inter/Geist, logo placement benar.
4. ✅ Responsive di mobile (≤640px), tablet (≤1024px), dan desktop (≥1024px).
5. ✅ Backend authorization terverifikasi: Admin yang hit endpoint mutasi menerima 403 Forbidden.
6. ✅ Filter dan search berjalan dengan dataset minimal **50 properti dummy**.
7. ✅ Dokumentasi singkat superadmin tersedia (cara tambah, edit, hapus properti; cara kelola akun admin).
8. ✅ Environment variables terdokumentasi di `.env.example`.
9. ✅ Tidak ada secret/API key yang ter-commit ke repository.

---

## 17. Out of Scope (Phase 2)

Fitur-fitur berikut **tidak termasuk** dalam scope Phase 1 dan dapat diimplementasi di iterasi selanjutnya:

| Fitur | Keterangan |
|---|---|
| **Arsip & Restore Properti** | Superadmin bisa lihat properti terhapus dan restore |
| **Upload Gambar Properti** | Sengaja dikecualikan di Phase 1 |
| **Notifikasi Real-time** | Push notification / websocket untuk update listing |
| **Export Data** | Export listing ke CSV/Excel |
| **Multi-language** | Bahasa Inggris atau bahasa lain |
| **Ganti Password Mandiri** | User bisa ganti password sendiri dari profile |
| **Reset Password via Email (Self-service)** | Forgot password flow untuk agent |
| **Dark Mode** | Toggle tema gelap |
| **Halaman Properti Publik Individual** | Halaman detail per properti untuk pengunjung umum |
| **Fitur Favorit/Bookmark** | Untuk pengunjung publik |

---

## Appendix — Seed Data & Testing

### A. Contoh Data Properti (untuk Testing)

```json
[
  {
    "nama_property": "Aston Villas Type A",
    "group": "Mentari",
    "lebar": 6.0,
    "panjang": 17.8,
    "hadap": ["Utara"],
    "tipe": "villa",
    "tingkat": 2,
    "price": 1350000000,
    "carport": true,
    "status": "in_stock",
    "siap": "siap_huni",
    "kawasan": ["Krakatau", "Pancing"],
    "unit": "Ready Siap huni"
  },
  {
    "nama_property": "Banyan Tree Blok A",
    "group": "Project Ville",
    "lebar": 4.5,
    "panjang": 21.5,
    "hadap": ["Timur", "Barat"],
    "tipe": "ruko",
    "tingkat": 2.5,
    "price": 980000000,
    "carport": false,
    "status": "sold_out",
    "siap": "siap_kosong",
    "kawasan": ["Cemara Asri/Kuala"],
    "maps_link": "https://maps.google.com/maps?q=...",
    "unit": "Gate siap"
  }
]
```

### B. Contoh Akun Test

```
Superadmin:
  Email: superadmin@primeproperty.id
  Password: [generate saat seed]

Admin:
  Email: admin@primeproperty.id
  Password: [generate saat seed]
```

### C. Environment Variables yang Dibutuhkan

```env
# Database
DATABASE_URL=postgresql://...

# Auth
SESSION_SECRET=...
COOKIE_DOMAIN=...

# Email (Contact Form)
SMTP_HOST=...
SMTP_PORT=587
SMTP_USER=...
SMTP_PASS=...
ADMIN_EMAIL=admin@primeproperty.id

# App
NEXT_PUBLIC_BASE_URL=https://primeproperty.id
NODE_ENV=production
```

---

*Dokumen ini adalah rujukan utama bagi tim development dan QA selama fase implementasi Prime Property Web Platform & Internal Agent Portal.*

**PRIME PROPERTY · PRD v1.0 · Dari Acceptance Criteria Document**
