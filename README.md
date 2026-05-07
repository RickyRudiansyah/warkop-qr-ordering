# Warkop QR Ordering System

Complete QR-based ordering system for warkop/tempat nongkrong — customer self-order + staff dashboards.

## 🎯 Overview

This system replaces traditional cashier-based ordering with a QR code flow:
1. Customer scans QR at table → opens menu in browser
2. Customer browses, adds to cart, selects payment method
3. Order auto-prints to kitchen (thermal printer)
4. Staff manages orders via dashboards (cashier, kitchen, owner)

**Target market**: Anak sekolah, remaja, umum — vibrant, youthful design.

## 🏗️ Architecture

```
┌─────────────┐      ┌──────────────┐      ┌──────────────┐
│   Customer  │─────▶│   Frontend   │─────▶│   Backend    │
│  (Mobile)   │      │ React + Vite │      │   FastAPI    │
└─────────────┘      └──────────────┘      └──────────────┘
                            │                      │
                            │                      │
                            ▼                      ▼
                     ┌──────────────┐      ┌──────────────┐
                     │   Supabase   │◀─────│  PostgreSQL  │
                     │  (Realtime)  │      │  (Database)  │
                     └──────────────┘      └──────────────┘
```

## 📦 Tech Stack

### Frontend (`/frontend`)
- React 18 + TypeScript + Vite
- Tailwind CSS v4 + shadcn/ui
- Framer Motion (animations)
- Supabase JS (Realtime)
- React Router (routing)

### Backend (`/backend`)
- FastAPI (Python)
- Supabase (PostgreSQL + Realtime)
- python-escpos (thermal printer)
- Midtrans/Xendit (payment gateway — to be integrated)

## 🚀 Quick Start

### 1. Backend Setup

```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt

# Configure .env
cp .env.example .env
# Edit .env with Supabase credentials

# Run server
uvicorn main:app --reload --port 8000
```

Backend runs at `http://localhost:8000`

### 2. Frontend Setup

```bash
cd frontend
npm install

# Configure .env
cp .env.example .env
# Edit .env with API URL and Supabase credentials

# Run dev server
npm run dev
```

Frontend runs at `http://localhost:5173`

### 3. Database Setup

Run the SQL schema in Supabase SQL Editor (see `backend/schema.sql` if available, or create tables manually):

**Tables needed:**
- `tables` — Table numbers and labels
- `categories` — Menu categories
- `menu_items` — Menu with prices, images, sold-out status
- `menu_variations` — Size, spice level, toppings
- `orders` — Order records
- `order_items` — Items per order

Enable Realtime on `menu_items` and `orders` tables in Supabase dashboard.

## 🎨 Design System

**Colors:**
- Primary: Teal (`#0d9488`)
- Accent: Yellow (`#facc15`)
- Surface: Dark slate (`#0f172a`)

**Typography:** Plus Jakarta Sans

**Vibe:** Vibrant, youthful, energetic — targeting remaja/anak sekolah demographic.

## 📱 Features

### MVP (Implemented)
- ✅ QR per meja → customer menu page
- ✅ Menu browsing with categories, search, sold-out toggle
- ✅ Cart with variations (size, spice, toppings)
- ✅ Checkout with QRIS / Transfer BCA / Cash
- ✅ Cashier dashboard: live order board, cash confirmation
- ✅ Kitchen display: ticket cards, status updates
- ✅ Owner dashboard: menu management, sold-out toggle
- ✅ Manual order input (cashier fallback)
- ✅ Realtime updates (Supabase)
- ✅ PWA support (Add to Home Screen)

### Phase 2 (Planned)
- [ ] Split bill
- [ ] Merge meja
- [ ] Sales reports (daily, weekly, monthly)
- [ ] Stock management with auto-alert
- [ ] Customer loyalty accounts

## 🔐 Staff Login (Demo)

For demo purposes, login uses mock auth:
- Username: `owner` → Owner dashboard
- Username: `cashier` → Cashier dashboard
- Username: `koki` → Kitchen display
- Password: any value

Replace with real auth in production (e.g., Supabase Auth or JWT).

## 📄 API Endpoints

### Menu
- `GET /api/menu` — All available menu items
- `GET /api/menu/categories` — All categories
- `PATCH /api/menu/:id/sold-out` — Toggle sold-out status

### Orders
- `POST /api/orders` — Create new order
- `GET /api/orders/active` — Get active orders
- `PATCH /api/orders/:id/confirm-cash` — Confirm cash payment
- `PATCH /api/orders/:id/status` — Update order status

### Tables
- `GET /api/tables` — All active tables
- `GET /api/tables/:number` — Get specific table

## 🖨️ Thermal Printer Setup

Kitchen printer integration uses ESC/POS protocol. Configure printer IP/port in backend `.env`:

```env
PRINTER_IP=192.168.1.100
PRINTER_PORT=9100
```

Use `python-escpos` library to send print jobs when order status changes to `CONFIRMED`.

## 🌐 Deployment

### Frontend
Deploy to Vercel/Netlify:
```bash
cd frontend
npm run build
# Upload dist/ folder or connect Git repo
```

### Backend
Deploy to Railway/Render/Fly.io:
```bash
cd backend
# Add Procfile or railway.toml
# Set environment variables in platform dashboard
```

### Database
Use Supabase hosted PostgreSQL (already configured).

## 📊 Database Schema

```sql
-- Tables
CREATE TABLE tables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_number INT UNIQUE NOT NULL,
  label TEXT,
  is_active BOOLEAN DEFAULT true
);

-- Categories
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  sort_order INT DEFAULT 0
);

-- Menu Items
CREATE TABLE menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price INT NOT NULL,
  image_url TEXT,
  category_id UUID REFERENCES categories(id),
  is_available BOOLEAN DEFAULT true,
  is_sold_out BOOLEAN DEFAULT false,
  sort_order INT DEFAULT 0
);

-- Menu Variations
CREATE TABLE menu_variations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_item_id UUID REFERENCES menu_items(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'size', 'spice', 'topping'
  name TEXT NOT NULL,
  price_modifier INT DEFAULT 0
);

-- Orders
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_id UUID REFERENCES tables(id),
  status TEXT NOT NULL, -- 'PENDING_CASH', 'CONFIRMED', 'PROCESSING', 'SERVED', 'CANCELLED'
  payment_method TEXT NOT NULL, -- 'CASH', 'QRIS', 'TRANSFER_BCA'
  total_amount INT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  confirmed_at TIMESTAMPTZ
);

-- Order Items
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id UUID,
  menu_item_name TEXT NOT NULL,
  menu_item_price INT NOT NULL,
  quantity INT NOT NULL,
  variations JSONB DEFAULT '[]',
  subtotal INT NOT NULL,
  notes TEXT
);
```

Enable Realtime:
```sql
ALTER PUBLICATION supabase_realtime ADD TABLE menu_items;
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
```

## 🤝 Contributing

1. Fork the repo
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📝 License

MIT

## 🙏 Acknowledgments

- Design inspiration: 21st.dev
- UI primitives: shadcn/ui
- Icons: Lucide React
- Fonts: Plus Jakarta Sans (Google Fonts)

---

**Built with ❤️ for warkop owners and their customers**
