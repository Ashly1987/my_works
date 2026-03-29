# Kiln Bakers — Project Documentation

A full-featured **Bakery Point-of-Sale (POS)** system built with React + Vite, backed by Supabase (PostgreSQL) for cloud data storage.

## Documentation Rule

- Any feature/UI/data-flow update in the app must be reflected in this file (`PROJECT.md`) in the same change set.

---

## Tech Stack

| Layer         | Technology                         | Version                    |
| ------------- | ---------------------------------- | -------------------------- |
| UI Framework  | React                              | 19                         |
| Build Tool    | Vite                               | 8                          |
| Routing       | React Router DOM                   | 7                          |
| Database      | Supabase (PostgreSQL)              | `@supabase/supabase-js` v2 |
| Charts        | Recharts                           | 3                          |
| Icons         | Lucide React                       | —                          |
| Notifications | React Hot Toast                    | 2                          |
| QR Code       | qrcode.react                       | 4                          |
| PDF Export    | jsPDF + html2canvas                | —                          |
| Fonts         | Nunito + Bree Serif (Google Fonts) | —                          |

---

## Project Structure

```
kiln-bakers/
├── public/
├── src/
│   ├── assets/
│   │   └── hero.png
│   ├── components/
│   │   ├── PrintableBill.jsx    # Printable/PDF bill layout
│   │   ├── ProductForm.jsx      # Add / edit product modal form
│   │   ├── QRModal.jsx          # UPI QR code payment modal
│   │   ├── Sidebar.jsx          # Left navigation sidebar
│   │   ├── Topbar.jsx           # Page top header bar
│   │   └── WhatsAppButton.jsx   # Floating WhatsApp chat button
│   ├── context/
│   │   └── CartContext.jsx      # Global cart state (useReducer)
│   ├── data/
│   │   ├── seedProducts.js      # 14 default bakery products (auto-seeded)
│   │   └── storage.js           # All Supabase data services
│   ├── lib/
│   │   └── supabaseClient.js    # Supabase singleton client
│   ├── pages/
│   │   ├── BillingPage.jsx      # Menu + cart + checkout (main POS screen)
│   │   ├── OrdersPage.jsx       # Full order history + printable bills
│   │   ├── ProductsPage.jsx     # Product catalogue manager (CRUD)
│   │   ├── ReportsPage.jsx      # Monthly revenue reports + bar chart
│   │   └── SettingsPage.jsx     # Store info, tax, UPI, WhatsApp config
│   ├── utils/
│   │   └── format.js            # Currency / date formatters
│   ├── App.jsx                  # Route definitions + global components
│   ├── main.jsx                 # React root entry point
│   └── index.css                # Global styles + design system
├── supabase/
│   └── schema.sql               # DB schema + RLS policies (run once)
├── .env                         # Local secrets (gitignored)
├── .env.example                 # Env var template (no real values)
├── package.json
└── vite.config.js
```

---

## Environment Variables

Create a `.env` (or `.env.local`) file in the project root:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

These are read by `src/lib/supabaseClient.js` via `import.meta.env`.  
**Never commit real credentials** — `.env` is gitignored.

---

## Supabase Database

### Tables

#### `products`

| Column        | Type          | Notes           |
| ------------- | ------------- | --------------- |
| `id`          | text PK       | `p_<timestamp>` |
| `name`        | text          |                 |
| `category`    | text          |                 |
| `price`       | numeric(10,2) |                 |
| `description` | text          |                 |
| `image`       | text          | URL             |
| `available`   | boolean       | default `true`  |
| `created_at`  | timestamptz   |                 |
| `updated_at`  | timestamptz   |                 |

#### `orders`

| Column           | Type          | Notes                             |
| ---------------- | ------------- | --------------------------------- |
| `id`             | text PK       | `ord_<timestamp>`                 |
| `bill_no`        | text unique   | `KB-<datetime>`                   |
| `items`          | jsonb         | Array of cart items               |
| `subtotal`       | numeric(10,2) |                                   |
| `discount_amt`   | numeric(10,2) |                                   |
| `tax_amt`        | numeric(10,2) |                                   |
| `total`          | numeric(10,2) |                                   |
| `tax_rate`       | numeric(5,2)  | Snapshot of rate at time of order |
| `payment_status` | text          | `pending` / `paid`                |
| `payment_method` | text          | `Cash` / `UPI`                    |
| `created_at`     | timestamptz   |                                   |

#### `app_settings`

| Column                      | Type         | Notes                                    |
| --------------------------- | ------------ | ---------------------------------------- |
| `id`                        | int PK       | Always `1` (single-row config)           |
| `store_name`                | text         |                                          |
| `store_address`             | text         |                                          |
| `store_phone`               | text         |                                          |
| `tax_rate`                  | numeric(5,2) | GST % applied at checkout                |
| `upi_id`                    | text         | UPI ID for QR payments                   |
| `upi_name`                  | text         | Merchant display name                    |
| `whatsapp_number`           | text         | With country code e.g. `+91 98765 43210` |
| `created_at` / `updated_at` | timestamptz  |                                          |

### RLS Policies

Row Level Security is enabled on all three tables with open `allow_all_*` policies — suitable for a single-owner POS. For multi-tenant or public-facing use, replace with auth-scoped policies.

### First-Run Auto-Seeding

On first page load (when tables are empty), `storage.js` automatically:

- Inserts all **14 default products** from `seedProducts.js` into `products`
- Inserts the **default settings row** (`id = 1`) into `app_settings`

Guarded by module-level boolean flags so it runs at most once per session.

To **reset and re-seed**, run in the Supabase SQL Editor:

```sql
delete from products;
delete from app_settings where id = 1;
```

Then refresh the app — seeds fire again automatically.

---

## Data Services (`src/data/storage.js`)

All data access is async, using the Supabase JS client. Column names are snake_case in DB and camelCase in the app — mapping happens in `storage.js`.

| Export            | Methods                                                         |
| ----------------- | --------------------------------------------------------------- |
| `productService`  | `getAll()`, `add(product)`, `update(id, changes)`, `delete(id)` |
| `orderService`    | `getAll()`, `add(order)`, `getByMonth(year, month)`             |
| `settingsService` | `get()`, `save(settings)`                                       |

---

## Pages

### `/` — Billing (Main POS)

- Displays the product grid (menu tiles, smaller image thumbnails)
- Add items to cart; apply discount; select payment method (Cash / UPI)
- UPI triggers a QR modal (`QRModal.jsx`) with live UPI deep-link QR
- Checkout creates an order in Supabase and clears the cart

### `/products` — Product Manager

- Full CRUD for the product catalogue
- `ProductForm.jsx` modal for add / edit
- Toggle availability on/off per product

### `/orders` — Order History

- Lists all past orders with totals, payment method, and status
- Print / export individual bills as PDF via `PrintableBill.jsx` + jsPDF

### `/reports` — Monthly Reports

- Month/year picker filters orders via `orderService.getByMonth()`
- Summary stats: total revenue, order count, average order value
- Bar chart (Recharts) showing daily revenue for the selected month

### `/settings` — Settings

- Store name, address, phone
- GST / tax rate (applied globally at checkout)
- UPI ID + merchant name (used by QR modal)
- WhatsApp number (used by floating chat button)

---

## Components

### `Sidebar.jsx`

Static nav with `NavLink` active-state highlighting. Links to all 5 routes.

### `Topbar.jsx`

Page title bar rendered at the top of each page.

### `CartContext.jsx`

Global cart state using `useReducer`. Actions: `ADD`, `REMOVE`, `UPDATE_QTY`, `CLEAR`, `SET_DISCOUNT`, `SET_PAYMENT`.

### `WhatsAppButton.jsx`

Fixed floating button (bottom-right). Reads `whatsappNumber` from settings on mount and re-fetches whenever `settings:updated` is dispatched (after a save in SettingsPage). Opens `https://wa.me/<digits>` in a new tab with a pre-filled greeting. Hidden when no number is configured.

### `QRModal.jsx`

Renders a UPI payment QR using `qrcode.react`. Accepts UPI ID, merchant name, and amount as props.

### `PrintableBill.jsx`

Off-screen bill layout captured by `html2canvas` and exported to PDF via jsPDF.

---

## Styling

Single CSS file: `src/index.css`

**Design tokens (CSS custom properties):**

```css
--primary: #e85d04 /* warm orange */ --secondary: #f48c06 --accent: #43aa8b
  --bg: #fff7f1 /* cream background */ --text: #35251d --radius: 14px
  --shadow: 0 8px 26px rgba(221, 121, 61, 0.15) --sidebar-w: 250px
  --header-h: 68px;
```

**Layout:** Flex row — fixed sidebar + scrollable main content area on desktop/tablet.  
**Responsive behavior:**

- `<= 1024px`: tighter spacing and reduced sidebar width.
- `<= 768px`: sidebar converts into a compact horizontal scroll navigation; topbar stacks cleanly; table containers remain scroll-safe.
- `<= 520px`: cart rows reflow to two-line layout; floating WhatsApp button becomes icon-only circular FAB.

**Breakpoint note:** The two-column billing layout is now tablet-only (`769px - 1024px`) so phones always show menu/cart in a single-column flow.

**Billing sizing note:** On larger screens the cart column uses adaptive width (`clamp(280px, 32vw, 390px)`) so the menu area scales with page size and does not feel squeezed.

---

## Running Locally

```bash
# 1. Install dependencies
npm install

# 2. Create environment file
cp .env.example .env
# Fill in VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY

# 3. Set up the database (run once in Supabase SQL Editor)
# → Copy and paste the contents of supabase/schema.sql

# 4. Start dev server
npm run dev
# → http://localhost:5173

# 5. Production build
npm run build
```

---

## Known Limitations / Future Improvements

- **No authentication** — RLS policies are open; any anon user with the URL can read/write. Add Supabase Auth + user-scoped policies for production.
- **No real-time sync** — Multiple POS terminals won't auto-update. Add Supabase Realtime subscriptions.
- **Single store** — `app_settings` is a single-row config (id = 1); not designed for multi-branch.
- **Image URLs only** — Product images are stored as URLs, not uploaded files. Add Supabase Storage for file uploads.
