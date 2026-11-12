# Doctor Tracker Frontend

Next.js 15 App Router web client for Doctor Tracker admin portal.

## Features

- **Dashboard**: Live analytics, KPIs, registration trends, condition distributions.
- **Doctor Management**: Search, filter, pagination, cascading patient management.
- **Patient Management**: Cross-doctor patient roster, detailed records, full filter controls.
- **Authentication**: Secure JWT access & refresh tokens via `httpOnly` cookies with route guard middleware.
- **UI & Accessibility**: Built with Tailwind CSS, Radix UI primitives, shadcn components, dark/light themes.

---

## Live Deployment (Vercel)

This frontend connects to the backend microservices via the **API Gateway**.

### Environment Variables on Vercel

> **Note on MongoDB URL**: You **DO NOT** add MongoDB URL to Vercel. Frontend never connects to database directly. MongoDB URL goes strictly to **Render** backend services.

In your [Vercel Project Settings](https://vercel.com) -> **Environment Variables**, add:

| Key | Value | Description |
|---|---|---|
| `API_GATEWAY_URL` | `https://doctor-tracker-backend-new.onrender.com` | Live URL of your Render backend API |
| `NEXT_PUBLIC_API_BASE_URL` | `/api/v1` | Base API route mapped via Next.js proxy rewrite |

### Deploy Steps
1. Import repository `doctor-tracker-frontend-new` into Vercel.
2. Framework Preset: **Next.js**.
3. Add the two environment variables above.
4. Click **Deploy**.

---

## Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

App runs on `http://localhost:3000`. Ensure backend API Gateway is running on `http://localhost:5050` or `http://localhost:5000` (configured in `.env.local`).

**Demo Credentials:**
- **Admin:** `admin@doctortracker.dev` / `Admin@12345`
- **Patient:** `patient@doctortracker.dev` / `Patient@12345`
