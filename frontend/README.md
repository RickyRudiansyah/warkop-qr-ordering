# Warkop QR Ordering — Frontend

Vibrant, mobile-first QR ordering system built with React + Vite + Tailwind CSS + shadcn/ui.

## Features

### Customer Flow
- 📱 Mobile-first menu browsing with category filters
- 🛒 Real-time cart with quantity controls
- 💳 Multi-payment support (QRIS, Transfer BCA, Cash)
- 🔄 Live sold-out updates via Supabase Realtime
- 🎨 Vibrant teal + yellow design system

### Staff Dashboards
- 💼 **Cashier**: Kanban-style order board, cash confirmation, manual order input
- 👨‍🍳 **Kitchen**: Large ticket cards, elapsed time tracking, status updates
- 👑 **Owner**: Menu management, sold-out toggle, stats dashboard

## Tech Stack

- **React 18** + **TypeScript**
- **Vite** — Fast build tool
- **Tailwind CSS v4** — Utility-first styling
- **shadcn/ui** — Radix UI primitives
- **Framer Motion** — Smooth animations
- **Supabase** — Realtime subscriptions
- **Axios** — API client
- **React Router** — Client-side routing
- **Sonner** — Toast notifications

## Setup

```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your API URL and Supabase credentials

# Run dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Environment Variables

```env
VITE_API_URL=http://localhost:8000/api
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

## Routes

### Customer
- `/order?table=5` — Menu page (QR entry point)
- `/checkout?table=5` — Checkout flow
- `/order-success` — Order confirmation

### Staff (Protected)
- `/login` — Staff login (demo: username "owner", "cashier", or "koki")
- `/dashboard/cashier` — Cashier order board
- `/dashboard/cashier/new-order` — Manual order input
- `/dashboard/kitchen` — Kitchen display
- `/dashboard/owner` — Menu management

## Design System

### Colors
- **Primary**: Teal (`#0d9488`)
- **Accent**: Yellow (`#facc15`)
- **Surface**: Dark slate (`#0f172a`, `#1e293b`)
- **Text**: Light slate (`#f8fafc`)

### Typography
- **Font**: Plus Jakarta Sans (400, 500, 600, 700, 800)

### Components
All UI components are in `src/components/ui/`:
- `Button` — Primary, accent, ghost, danger variants
- `Badge` — Status indicators
- `Spinner` — Loading states
- `Skeleton` — Content placeholders
- `EmptyState` — No-data views

## Project Structure

```
src/
├── components/
│   ├── ui/              # Shared primitives
│   ├── menu/            # Menu browsing components
│   ├── cart/            # Cart drawer & FAB
│   ├── dashboard/       # Staff dashboard components
│   └── auth/            # Login & route protection
├── pages/               # Route-level views
├── hooks/               # useMenu, useOrders, etc.
├── context/             # CartContext, AuthContext
├── lib/                 # API client, Supabase, utils
└── types/               # TypeScript interfaces
```

## Development

### Adding a new page
1. Create component in `src/pages/`
2. Add route in `src/App.tsx`
3. Wrap with `<ProtectedRoute>` if staff-only

### Adding a new UI component
1. Create in `src/components/ui/`
2. Export from `src/components/ui/index.tsx`
3. Use Tailwind + CSS variables for theming

### Realtime subscriptions
All Realtime logic is in hooks (`useMenu`, `useOrders`). Supabase client is in `src/lib/supabase.ts`.

## PWA Support

Manifest is at `public/manifest.json`. Add icons (`icon-192.png`, `icon-512.png`) to enable "Add to Home Screen".

## License

MIT
