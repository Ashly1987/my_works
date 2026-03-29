# Kiln Bakers

Kiln Bakers is a bakery POS application for billing, product management, order tracking, reports, and store settings.

## How To Use

### Guest

- Open the app and browse the Menu / Billing page directly.
- Add products to the cart.
- When you try to place an order, you will be asked to sign in or create a guest account.
- Guest users can place orders, but they cannot open admin pages.
- Signed-in sessions are logged out automatically after 5 minutes of inactivity.

### Admin

- Click `Admin Login` in the sidebar.
- For now, use:
  - username: `admin`
  - password: `admin`
- After sign-in, you will be redirected to the admin area.
- Admin can access Products, Orders, Reports, and Settings.
- Admin sessions are also logged out automatically after 5 minutes of inactivity.
- In Order History, admins can see which signed-in user placed each order.

## Local Setup

1. Install dependencies: `npm install`
2. Add Supabase credentials to `.env`
3. Run the SQL from `supabase/schema.sql` in your Supabase SQL Editor
4. Start the app: `npm run dev`

## Notes

- New signups are always created as guest accounts.
- The `admin/admin` login is a temporary development shortcut and should be replaced before production.
- The app re-checks session state when the tab becomes active again, so cleared sessions are logged out automatically.
- Each created order stores the signed-in user ID and email for audit tracking.
