# Store App

Single-vendor e-commerce platform built with **Next.js 15**, **PostgreSQL (Supabase)**, **Prisma ORM**, **Redux Toolkit**, **shadcn/ui**, and **TypeScript**.

---

## 📖 Complete Documentation & Architecture

For a comprehensive guide covering architecture blueprints, data models, BigInt serialization rules, API conventions, and step-by-step developer onboarding, please read:

👉 **[DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md)**

---

## ⚡ Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env.local` and add your database and Supabase keys:
```bash
cp .env.example .env.local
```

### 3. Initialize Database & Generate Prisma Client
1. Run [`supabase/migrations/0001_init.sql`](./supabase/migrations/0001_init.sql) in your Supabase SQL editor.
2. Generate the Prisma client:
```bash
npx prisma generate
```

### 4. Start Local Development Server
```bash
npm run dev
```

- **Storefront**: [http://localhost:3000](http://localhost:3000)
- **Admin Panel**: [http://localhost:3000/admin/dashboard](http://localhost:3000/admin/dashboard)
- **API Endpoints**: [http://localhost:3000/api](http://localhost:3000/api)

---

## 📂 Project Architecture

```
src/
├── app/                  # Next.js App Router (auth, storefront, admin, api)
├── controllers/          # Business logic & response envelope formatting
├── models/               # Database operations & BigInt-safe serialization
├── services-client/      # Reusable frontend API clients
├── store/                # Redux Toolkit slices (auth, cart, product, theme)
├── components/           # UI primitives (shadcn), features, and layouts
├── middlewares/          # withAuth, withRole, withErrorHandler route guards
├── lib/                  # Singletons (Prisma, Supabase)
└── utils/                # Utility helpers (cn, formatCurrency, generateSku)
```
