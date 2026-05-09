# 🍜 Warkop QR Ordering System

> Sistem pemesanan digital berbasis QR Code untuk warung/kafe — customer scan, pesan, bayar tanpa antri ke kasir.

![Tech Stack](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-61DAFB?style=flat-square&logo=react)
![Backend](https://img.shields.io/badge/Backend-FastAPI-009688?style=flat-square&logo=fastapi)
![Database](https://img.shields.io/badge/Database-Supabase-3ECF8E?style=flat-square&logo=supabase)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript)
![Auth](https://img.shields.io/badge/Auth-Supabase%20Auth-3ECF8E?style=flat-square&logo=supabase)

---

## ✨ Fitur Utama

### 👥 Customer
- Scan QR Code di meja → langsung buka menu
- Browse menu per kategori + search
- Pilih variasi (ukuran, level pedas, topping)
- Tambah catatan per item
- Checkout dengan pilihan pembayaran: **Cash**, **QRIS**, **Transfer BCA**
- Konfirmasi pesanan dengan nomor order

### 👨‍💼 Kasir
- Dashboard Kanban — lihat semua order aktif real-time
- Konfirmasi pembayaran cash
- Update status order: Dikonfirmasi → Diproses → Selesai
- Cancel order dengan alasan
- Input order manual (untuk pelanggan yang tidak scan QR)
- Generator QR Code per meja (download PNG / print)

### 👨‍🍳 Dapur (Kitchen Display)
- Tampilan ticket pesanan real-time
- Timer warna per order (kuning > 15 mnt, merah > 25 mnt)
- Tombol **Mulai Proses** dan **Sudah Diantar**
- Animasi ticket masuk/keluar

### 👑 Owner
- Manajemen menu (tambah, edit, toggle sold out)
- Statistik menu (total, tersedia, habis)
- **Rekap penjualan** — filter hari ini / 7 hari / semua
- Top menu terlaris + recent orders
- Statistik pendapatan, rata-rata order, order dibatalkan

---

## 🛠️ Tech Stack

| Layer | Teknologi |
|---|---|
| Frontend | React 18, Vite, TypeScript, Tailwind CSS |
| Backend | FastAPI, Python 3.11 |
| Database | Supabase (PostgreSQL + Realtime) |
| Auth | **Supabase Auth** + Row Level Security |
| Animation | Framer Motion |
| QR Code | qrcode.react |
| Deployment | Vercel (frontend), Railway (backend) |

---

## 📁 Struktur Project

```
warkop-qr-ordering/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/          # ProtectedRoute
│   │   │   ├── dashboard/     # DashboardLayout, OrderCard
│   │   │   ├── menu/          # MenuItemCard, MenuItemSheet, CategoryPills
│   │   │   └── ui/            # Button, Badge, Spinner, EmptyState
│   │   ├── context/
│   │   │   ├── AuthContext.tsx
│   │   │   └── CartContext.tsx
│   │   ├── hooks/
│   │   │   ├── useMenu.ts
│   │   │   └── useOrders.ts
│   │   ├── pages/
│   │   │   ├── MenuPage.tsx
│   │   │   ├── CheckoutPage.tsx
│   │   │   ├── LoginPage.tsx
│   │   │   ├── CashierDashboard.tsx
│   │   │   ├── KitchenDisplay.tsx
│   │   │   ├── ManualOrderPage.tsx
│   │   │   ├── OwnerDashboard.tsx
│   │   │   └── QRGeneratorPage.tsx
│   │   ├── types/index.ts
│   │   └── lib/
│   │       ├── api.ts         # Axios instance
│   │       ├── supabase.ts    # Supabase client
│   │       └── utils.ts       # formatRupiah, formatTime, dll
│   └── package.json
└── backend/
    ├── main.py
    ├── database.py
    ├── routes/
    │   ├── menu.py
    │   ├── orders.py
    │   ├── tables.py
    │   └── health.py
    ├── Procfile               # Railway start command
    └── requirements.txt
```

---

## 🚀 Cara Menjalankan Lokal

### Prerequisites
- Node.js 18+
- Python 3.11+
- Akun Supabase

### 1. Clone Repository
```bash
git clone https://github.com/RickyRudiansyah/warkop-qr-ordering.git
cd warkop-qr-ordering
```

### 2. Setup Supabase

Jalankan SQL berikut di Supabase SQL Editor:

```sql
-- Table staff untuk role-based auth
CREATE TABLE IF NOT EXISTS staff_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('cashier', 'koki', 'owner')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS Policy
ALTER TABLE staff_users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can read own data"
  ON staff_users FOR SELECT TO authenticated
  USING (email = auth.email());

-- Insert staff awal
INSERT INTO staff_users (email, name, role) VALUES
  ('owner@warkop.com', 'Owner', 'owner'),
  ('cashier@warkop.com', 'Kasir 1', 'cashier'),
  ('koki@warkop.com', 'Koki 1', 'koki');
```

Lalu buat akun di **Supabase → Authentication → Users** dengan email yang sama.

### 3. Setup Backend
```bash
# Buat virtual environment
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Mac/Linux

# Install dependencies
pip install -r backend/requirements.txt

# Buat file .env di folder backend/
# Isi:
# SUPABASE_URL=https://xxxx.supabase.co
# SUPABASE_KEY=your_service_role_key

# Jalankan backend
uvicorn backend.main:app --reload --port 8000
```

### 4. Setup Frontend
```bash
cd frontend
npm install

# Buat file .env
# Isi:
# VITE_API_URL=http://localhost:8000/api
# VITE_SUPABASE_URL=https://xxxx.supabase.co
# VITE_SUPABASE_ANON_KEY=your_anon_key

# Jalankan frontend
npm run dev
```

### 5. Buka di Browser

| URL | Halaman |
|---|---|
| `http://localhost:5173/order?table=1` | Menu Customer |
| `http://localhost:5173/login` | Login Staff |
| `http://localhost:5173/dashboard/cashier` | Dashboard Kasir |
| `http://localhost:5173/dashboard/kitchen` | Kitchen Display |
| `http://localhost:5173/dashboard/owner` | Owner Dashboard |
| `http://localhost:5173/dashboard/qr` | QR Generator |
| `http://localhost:8000/docs` | Swagger API Docs |

---

## 🔐 Login Staff

| Email | Role | Akses |
|---|---|---|
| `owner@warkop.com` | Owner | Semua halaman |
| `cashier@warkop.com` | Kasir | Dashboard Kasir, Manual Order, QR Generator |
| `koki@warkop.com` | Koki | Kitchen Display |

> Password dikonfigurasi saat membuat user di Supabase Auth Dashboard.

---

## 🗄️ Database Schema (Supabase)

```sql
-- Tabel utama
tables          -- Data meja (id, table_number, label, is_active)
menu_categories -- Kategori menu
menu_items      -- Item menu + variasi
menu_variations -- Variasi item (size, spicy_level, topping)
orders          -- Order dari customer
order_items     -- Detail item per order
staff_users     -- Data staff + role untuk auth
activity_logs   -- Log aktivitas kasir (cancel, dll)
```

---

## 📡 API Endpoints

### Menu
| Method | Endpoint | Deskripsi |
|---|---|---|
| GET | `/api/menu` | Ambil semua menu |
| GET | `/api/menu/categories` | Ambil semua kategori |
| POST | `/api/menu` | Tambah menu baru |
| PUT | `/api/menu/{id}` | Update menu |
| PATCH | `/api/menu/{id}/sold-out` | Toggle sold out |

### Orders
| Method | Endpoint | Deskripsi |
|---|---|---|
| POST | `/api/orders` | Buat order baru |
| GET | `/api/orders/active` | Ambil order aktif |
| GET | `/api/orders/history` | Ambil histori order (rekap) |
| GET | `/api/orders/{id}` | Detail order |
| PATCH | `/api/orders/{id}/confirm-cash` | Konfirmasi bayar cash |
| PATCH | `/api/orders/{id}/status` | Update status order |
| PATCH | `/api/orders/{id}/cancel` | Cancel order |

### Tables
| Method | Endpoint | Deskripsi |
|---|---|---|
| GET | `/api/tables` | Ambil semua meja |
| GET | `/api/tables/{table_number}` | Ambil meja by nomor |

---

## 🔄 Alur Pemesanan

```
Customer scan QR
      ↓
Buka MenuPage (/order?table=1)
      ↓
Pilih menu + variasi → Cart
      ↓
Checkout → Pilih payment method
      ↓
Submit Order → Backend → Supabase
      ↓
CashierDashboard (realtime update)
      ↓
Kasir konfirmasi → CONFIRMED
      ↓
KitchenDisplay → Dapur proses
      ↓
PROCESSING → SERVED ✅
```

---

## 🚢 Deployment

### Backend → Railway
1. Connect repo ke [Railway](https://railway.app)
2. Set **Root Directory**: `backend`
3. Set environment variables:
   ```
   SUPABASE_URL=https://xxxx.supabase.co
   SUPABASE_KEY=your_service_role_key
   ```
4. Start command otomatis dari `Procfile`:
   ```
   web: uvicorn backend.main:app --host 0.0.0.0 --port $PORT
   ```

### Frontend → Vercel
1. Connect repo ke [Vercel](https://vercel.com)
2. Set **Root Directory**: `frontend`
3. Set environment variables:
   ```
   VITE_API_URL=https://your-backend.up.railway.app/api
   VITE_SUPABASE_URL=https://xxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=your_anon_key
   ```
4. File `public/vercel.json` sudah tersedia untuk SPA routing.

---

## 👨‍💻 Developer

**Ricky Rudiansyah** — BINUS University, Research Track AI & Robotika

---

## 📄 License

MIT License — bebas digunakan dan dimodifikasi.
