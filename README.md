# 🏨 Grand Luxe Hotel & Suites — Web Application

A full-stack, responsive, and luxury hotel reservation and management system deployed on **Vercel**, backed by persistent **Supabase PostgreSQL**, and integrated with **Resend** for real-time automated email notifications.

---

## 🏛️ System Architecture

```
                                  ┌───────────────────────────┐
                                  │      Vercel Platform      │
                                  └─────────────┬─────────────┘
                                                │
                 ┌──────────────────────────────┴──────────────────────────────┐
                 │                                                             │
                 ▼                                                             ▼
     ┌───────────────────────┐                                     ┌───────────────────────┐
     │  Vite + React SPA     │  === Axios JSON REST API ===>       │ Node.js Serverless    │
     │  (frontend/dist)      │                                     │ Functions (api/index) │
     └───────────────────────┘                                     └───────────┬───────────┘
                                                                               │
                                               ┌───────────────────────────────┴───────────────────────────────┐
                                               │                                                               │
                                               ▼                                                               ▼
                                  ┌───────────────────────────┐                                   ┌───────────────────────────┐
                                  │    Supabase PostgreSQL   │                                   │       Resend API          │
                                  │  - Persistent Tables      │                                   │  - Hotel Owner Alert      │
                                  │  - GIST Date Exclusion    │                                   │  - Guest Confirmation     │
                                  │  - Row Level Security     │                                   │  - Audit Outbox Logs      │
                                  └───────────────────────────┘                                   └───────────────────────────┘
```

---

## 🌟 Key Features

1. **Persistent Database (Supabase PostgreSQL)**:
   - Full idempotent schema (`supabase/schema.sql`) for rooms, users, bookings, and notification logs.
   - **PostgreSQL GIST Exclusion Constraint** (`no_overlapping_bookings`) preventing concurrent double-bookings at the database engine level.
   - Row-Level Security (RLS) policies protecting sensitive reservation records.
   - Pre-seeded with 12 luxury hotel suites (Presidential, Royal, Executive, Deluxe) and an administrator account (`admin@hotel.com`).

2. **Trusted Server-Side Pricing Engine**:
   - Zero client-side price trust: room rates are queried directly from the verified database record.
   - Strict stay duration calculation and configurable GST / hotel tax (`HOTEL_TAX_PERCENTAGE`).

3. **Strict Half-Open Interval Availability Logic**:
   - Date range overlap checks use the industry-standard half-open interval `[check_in, check_out)`.
   - **Back-to-back reservations are supported**: A new guest can check in on the same day a departing guest checks out (e.g. check-out Oct 13, new check-in Oct 13).

4. **Resend Email Notification Integration**:
   - Dispatches a luxury HTML & plain-text reservation notification to the hotel owner (`HOTEL_NOTIFICATION_EMAIL`) immediately upon booking confirmation.
   - Includes booking reference, guest contact information, dates, room number, financial breakdown, and special instructions.
   - **Error-Resilient**: Email dispatch failures never block or crash guest bookings. Errors are logged to the `notification_logs` table with status `FAILED` and can be retried by administrators.
   - Optional guest confirmation receipt email (`SEND_CUSTOMER_CONFIRMATION=true`).

5. **Universal Booking Flow (Guest & Authenticated)**:
   - Guests can book rooms directly without mandatory account registration.
   - Authenticated members can view and manage reservations under **My Bookings**.

6. **Comprehensive Administrative Dashboard**:
   - Real-time revenue analytics, occupancy rates, and booking status distributions.
   - Room management (create, update pricing/capacity, change maintenance status).
   - Booking management (confirm, check-in, check-out, cancel, and retry failed notification emails).
   - Guest relations customer directory.

---

## 🚀 Quick Start & Local Setup

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher
- A free **Supabase** project: [https://supabase.com](https://supabase.com)
- A free **Resend** account: [https://resend.com](https://resend.com)

### 2. Clone and Install
```bash
git clone https://github.com/derikaustin1-ship-it/hotel.git
cd hotel
npm install
npm install --prefix frontend
```

### 3. Database Migration (Supabase)
1. Open your Supabase Dashboard -> **SQL Editor**.
2. Create a new query, paste the contents of `supabase/schema.sql`, and click **Run**.
3. This creates all tables, triggers, indexes, and populates the 12 initial luxury suites.

### 4. Environment Configuration
Copy `.env.example` to `.env` in the root folder:
```bash
cp .env.example .env
```
Fill in your credentials:
```env
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
RESEND_API_KEY=re_your_resend_api_key
HOTEL_NOTIFICATION_EMAIL=owner@yourhotel.com
JWT_SECRET=your_custom_jwt_secret_key
```

### 5. Run Locally
```bash
# Starts both Express API (port 3001) and Vite React Frontend (port 5173) concurrently:
npm run dev
```
Open your browser at `http://localhost:5173`.

### 6. Run Automated Verification Tests
```bash
npm test
```
Executes 19 automated unit & integration tests validating pricing calculations, half-open interval overlap detection, back-to-back booking acceptance, input validation, and email resilience.

---

## ☁️ Deployment on Vercel

The application is pre-configured for seamless deployment on Vercel using `vercel.json`.

### Steps:
1. Push your repository to GitHub.
2. In the [Vercel Dashboard](https://vercel.com), click **Add New Project** and select this repository.
3. Configure the following **Environment Variables** in Vercel:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `RESEND_API_KEY`
   - `RESEND_FROM_EMAIL` (e.g. `Grand Luxe Hotel <onboarding@resend.dev>`)
   - `HOTEL_NOTIFICATION_EMAIL`
   - `JWT_SECRET`
4. Deploy! Vercel automatically runs `npm run build` to build the frontend and serves serverless functions via `api/index.js`.

---

## 📡 REST API Reference

### Public & Customer Endpoints
- `GET /api/health` — System status and configuration checks
- `GET /api/rooms` — Browse all rooms with optional filtering
- `GET /api/rooms/available` — Search rooms available for specific dates and guest counts
- `GET /api/rooms/:id` — View specific room details
- `POST /api/bookings` — Create a reservation (with server-side validation and owner email notification)
- `GET /api/bookings/:id` — Fetch booking details by ID or reference code
- `GET /api/bookings/my` — Fetch bookings for the logged-in user (`Authorization: Bearer <token>`)
- `PUT /api/bookings/:id/cancel` — Cancel a reservation
- `POST /api/auth/register` — Register a customer account
- `POST /api/auth/login` — Sign in and receive JWT token

### Admin Endpoints (Require `role: ADMIN`)
- `GET /api/admin/dashboard` — Revenue, occupancy, and distribution metrics
- `POST /api/rooms` — Create new hotel room
- `PUT /api/rooms/:id` — Update room rate, capacity, amenities, or status
- `DELETE /api/rooms/:id` — Remove a room
- `PUT /api/bookings/:id/status` — Update reservation status (`CONFIRMED`, `CHECKED_IN`, `CHECKED_OUT`, `CANCELLED`)
- `POST /api/bookings/:id/retry-email` — Re-dispatch failed owner notification email
- `GET /api/admin/customers` — Directory of registered guests

---

## 🔐 Default Admin Account
To sign in to the Administrative Management Console (`/admin/login`):
- **Email**: `admin@hotel.com`
- **Password**: `admin123`
*(Created in `supabase/schema.sql`)*