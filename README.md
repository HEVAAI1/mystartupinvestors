
# MyFundingList

A comprehensive platform connecting startups with investors. This application features a robust investor database, credit-based access system, startup submission workflow, and a full-featured admin panel.

## 🚀 Feature

### User Platform
- **Investor Database**: Searchable and filterable list of verified investors.
- **Credit System**: Atomic credit usage tracking for viewing investor contact details.
- **Startup Management**: Users can submit and manage their startup details.
- **Authentication**: Secure Google OAuth login via Supabase.
- **Responsive Design**: Modern UI built with Tailwind CSS and Framer Motion.

### Admin Panel
- **Dashboard**: Analytics and overview of platform activity.
- **Data Management**: Manage Users, Startups, and Investors.
- **Export**: Export data to Excel (XLSX).
- **Security**: Dedicated admin route protection.

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Language**: TypeScript
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Database & Auth**: [Supabase](https://supabase.com/)
- **UI Components**: Radix UI, Lucide React, React Icons
- **Animations**: Framer Motion
- **Charts**: Recharts
- **Utilities**: XLSX (Excel export), Zod (Validation)

## 🏁 Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- A Supabase project

### 1. Clone the repository
```bash
git clone <repository-url>
cd investorlist-app
```

### 2. Install dependencies
```bash
npm install
```

### 3. Environment Setup
Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Database Setup
You need to run specific SQL scripts in your Supabase SQL Editor to set up the necessary tables, functions, and roles.

**Required SQL Scripts:**
1. **Atomic Credits**: Run `supabase_credit_function.sql` to enable race-condition-free credit updates.
2. **User Roles**: Run `setup_user_roles.sql` to enable route protection (Admin vs User).

### 5. Run the development server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser.

## 📧 Transactional Email

Account, billing, credit, startup, contact, and affiliate emails are sent through a durable outbox (`email_outbox` table, see `supabase/migrations/12_email_outbox.sql`) and a shared Resend dispatcher. Product routes enqueue an event after their database mutation succeeds; a Vercel Cron job retries anything still pending.

Requires these environment variables — set locally in `.env.local`, and **separately in the Vercel project's environment variable settings**, since `.env.local` is never deployed:

- `RESEND_API_KEY` — Resend API key used to send outbound mail.
- `CONTACT_FROM_EMAIL` — the verified "from" identity emails are sent as (e.g. `MyFundingList <hello@myfundinglist.com>`).
- `CRON_SECRET` — bearer token the retry route (`/api/cron/email-dispatch`) requires; Vercel Cron sends it automatically as `Authorization: Bearer $CRON_SECRET` when this variable is set on the project.

The retry schedule is defined in `vercel.json` (`/api/cron/email-dispatch`, every 15 minutes) and only takes effect once deployed to Vercel — it does not run under `npm run dev`.

## 🔒 Security & Route Protection

The application implements a 3-layer security system:
1. **Middleware**: Server-side protection redirecting unauthorized users.
2. **User Layout**: Prevents admins from accessing user dashboards.
3. **Admin Layout**: Prevents regular users from accessing admin panels.

**Roles:**
- `user`: Default role. Access to dashboard and startup features.
- `admin`: Full access to admin panel.

To make a user an admin, run this SQL:
```sql
UPDATE public.users SET role = 'admin' WHERE email = 'your-email@example.com';
```

## 📂 Project Structure

```
src/
├── app/
│   ├── (app)/          # User platform routes (protected)
│   ├── (marketing)/    # Marketing pages
│   ├── admin/          # Admin panel routes (protected)
│   ├── api/            # API routes
│   ├── auth/           # Auth callback
│   └── layout.tsx      # Root layout
├── components/         # Reusable UI components
├── context/            # React Context (Credits, etc.)
├── lib/                # Utilities and Supabase clients
└── middleware.ts       # Route protection logic
```

## 🐛 Recent Fixes & Improvements

We have recently addressed several critical issues. Please refer to the following documentation for details:

- **[ALL_BUGS_FIXED.md](./ALL_BUGS_FIXED.md)**: Overview of all recent fixes.
- **[ROUTE_PROTECTION.md](./ROUTE_PROTECTION.md)**: Details on the security implementation.
- **[LOGOUT_AND_CREDIT_FIXES.md](./LOGOUT_AND_CREDIT_FIXES.md)**: Fixes for logout race conditions and atomic credit updates.
- **[CREDITS_RESET_BUG_FIX.md](./CREDITS_RESET_BUG_FIX.md)**: Fix for the critical bug where credits were reset on login.

## 📄 License

[MIT](LICENSE)
