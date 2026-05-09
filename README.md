# 🍜 Warkop QR Ordering System

> Sistem pemesanan digital berbasis QR Code untuk warung/kafe — customer scan, pesan, bayar tanpa antri ke kasir.

![Tech Stack](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-61DAFB?style=flat-square&logo=react)
![Backend](https://img.shields.io/badge/Backend-FastAPI-009688?style=flat-square&logo=fastapi)
![Database](https://img.shields.io/badge/Database-Supabase-3ECF8E?style=flat-square&logo=supabase)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript)

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
- Generator QR Code per meja (download PNG / print)

### 👨‍🍳 Dapur (Kitchen Display)
- Tampilan ticket pesanan real-time
- Timer warna per order (kuning > 15 mnt, merah > 25 mnt)
- Tombol **Mulai Proses** dan **Sudah Diantar**
- Animasi ticket masuk/keluar (framer-motion)

### 👑 Owner
- Manajemen menu (tambah, edit, toggle sold out)
- Statistik menu (total, tersedia, habis)

---

## 🛠️ Tech Stack

| Layer | Teknologi |
|---|---|
| Frontend | React 18, Vite, TypeScript, Tailwind CSS |
| Backend | FastAPI, Python 3.11 |
| Database | Supabase (PostgreSQL + Realtime) |
| Auth | Mock Auth (JWT-ready) |
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
│   │   │   ├── OwnerDashboard.tsx
│   │   │   └── QRGeneratorPage.tsx
│   │   ├── types/index.ts
│   │   └── lib/
│   │       ├── api.ts         # Axios instance
│   │       └── utils.ts       # formatRupiah, formatTime, dll
│   └── package.json
└── backend/
    ├── main.py
    ├── routes/
    │   ├── menu.py
    │   ├── orders.py
    │   ├── tables.py
    │   └── health.py
    ├── models/
    ├── schemas/
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

### 2. Setup Backend
```bash
# Buat virtual environment
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Mac/Linux

# Install dependencies
pip install -r backend/requirements.txt

# Buat file .env di folder backend/
cp backend/.env.example backend/.env
# Isi SUPABASE_URL dan SUPABASE_KEY di .env

# Jalankan backend
uvicorn backend.main:app --reload --port 8000
```

### 3. Setup Frontend
```bash
cd frontend
npm install

# Buat file .env
cp .env.example .env
# Isi VITE_API_URL=http://localhost:8000/api

# Jalankan frontend
npm run dev
```

### 4. Buka di Browser

| URL | Halaman |
|---|---|
| `http://localhost:5173/order?table=1` | Menu Customer |
| `http://localhost:5173/login` | Login Staff |
| `http://localhost:5173/dashboard/cashier` | Dashboard Kasir |
| `http://localhost:5173/dashboard/kitchen` | Kitchen Display |
| `http://localhost:5173/dashboard/qr` | QR Generator |
| `http://localhost:8000/docs` | Swagger API Docs |

---

## 🔐 Demo Login

| Username | Password | Role | Akses |
|---|---|---|---|
| `cashier` | apa saja | Kasir | Dashboard Kasir, QR Generator |
| `koki` | apa saja | Koki | Kitchen Display |
| `owner` | apa saja | Owner | Semua halaman |

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

### Frontend (Vercel)
```bash
cd frontend
npm run build
# Upload ke Vercel atau connect GitHub repo
# Set env: VITE_API_URL=https://your-backend.railway.app/api
```

### Backend (Railway)
```bash
# Connect GitHub repo ke Railway
# Set environment variables:
# SUPABASE_URL=...
# SUPABASE_KEY=...
# Start command: uvicorn backend.main:app --host 0.0.0.0 --port $PORT
```

---

## 👨‍💻 Developer

**Ricky Rudiansyah** — BINUS University, Research Track AI & Robotika

---

## 📄 License

MIT License — bebas digunakan dan dimodifikasi.
