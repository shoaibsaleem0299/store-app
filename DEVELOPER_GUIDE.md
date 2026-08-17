# Store App — Comprehensive Developer Guide & Architecture

Welcome to the **Store App** codebase! This document provides complete context, architectural blueprints, data flow diagrams, and onboarding instructions to help any engineer understand, develop, and extend this project.

---

## 1. Project Overview

**Store App** is an e-commerce platform featuring a modern **Storefront** for shoppers and an **Admin CMS** for store managers.

### Core Stack
- **Framework**: [Next.js 15 (App Router)](https://nextjs.org/) + [React 19](https://react.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Database & Storage**: [PostgreSQL (Supabase)](https://supabase.com/)
- **ORM**: [Prisma](https://www.prisma.io/) (with `@prisma/adapter-pg` and custom generated client)
- **State Management**: [Redux Toolkit (RTK)](https://redux-toolkit.js.org/)
- **UI & Styling**: [Tailwind CSS](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/) (Radix UI) + [Lucide Icons](https://lucide.dev/)
- **Authentication**: Custom JWT authentication with `bcrypt` password hashing and role-based guards (`admin` vs `customer`).

---

## 2. System Architecture & Design Patterns

The codebase adopts a **Layered MVC (Model-View-Controller)** pattern tailored for Next.js App Router:

```
┌────────────────────────────────────────────────────────┐
│                   FRONTEND / CLIENT                    │
│  Storefront UI ((storefront))  │  Admin Panel (admin)  │
│          Redux Toolkit Slices (Cart, Auth, Product)    │
│            Client Services (extends BaseApiService)    │
└───────────────────────────┬────────────────────────────┘
                            │ HTTP (fetch / JSON)
┌───────────────────────────▼────────────────────────────┐
│                    API ROUTE HANDLERS                  │
│       src/app/api/...  (NextRequest / NextResponse)    │
│       Middlewares: withAuth, withRole, ErrorHandler    │
└───────────────────────────┬────────────────────────────┘
                            │ Method invocation
┌───────────────────────────▼────────────────────────────┐
│                       CONTROLLERS                      │
│       src/controllers/... (extends BaseController)     │
│   • Request parsing (Pagination, Status, SearchParams) │
│   • Envelope formatting: { success, data, meta }       │
└───────────────────────────┬────────────────────────────┘
                            │ Async calls
┌───────────────────────────▼────────────────────────────┐
│                         MODELS                         │
│       src/models/... (extends BaseModel)               │
│   • Prisma ORM Transactions & Queries                  │
│   • Data transformation (camelCase ↔ snake_case)       │
│   • BigInt & Decimal JSON serialization safety         │
└───────────────────────────┬────────────────────────────┘
                            │ Database Connection Pool
┌───────────────────────────▼────────────────────────────┐
│                   DATABASE & STORAGE                   │
│   • PostgreSQL (Tables, Constraints, Indexes)          │
│   • Supabase Storage (Product Media Bucket)            │
└────────────────────────────────────────────────────────┘
```

---

## 3. Directory Structure Explained

```tree
store-app/
├── prisma/
│   └── schema.prisma              # Prisma data model & database schema
├── public/                        # Static assets (images, fonts)
├── src/
│   ├── app/                       # Next.js App Router root
│   │   ├── (auth)/                # Auth routes: /login, /register
│   │   ├── (storefront)/          # Public storefront: /, /products/[id], /cart, /checkout, /orders
│   │   ├── admin/                 # Protected admin CMS: /admin/dashboard, /products, /orders, /categories, /customers
│   │   ├── api/                   # REST API route handlers
│   │   │   ├── admin/             # Admin protected APIs (dashboard stats, order status, etc.)
│   │   │   ├── auth/              # Auth endpoints: /login, /register, /logout
│   │   │   ├── cart/              # Cart CRUD
│   │   │   ├── categories/        # Category hierarchy CRUD
│   │   │   ├── orders/            # Order placement & retrieval
│   │   │   └── products/          # Product catalog & variant queries
│   │   ├── globals.css            # Tailwind & shadcn CSS theme variables
│   │   └── layout.tsx             # Root layout with ThemeProvider, Redux Provider, and Toast notifications
│   │
│   ├── components/
│   │   ├── features/              # Complex domain components
│   │   │   ├── admin/             # ProductForm (matrix generator), OrderTable
│   │   │   └── storefront/        # CartDrawer, ProductCard, VariantSelector
│   │   ├── layout/                # StorefrontNav, AdminSidebar, Providers, ThemeProvider
│   │   ├── shared/                # DataTable, StatCard, PriceTag, StockBadge, Uploads
│   │   └── ui/                    # shadcn/ui primitives (button, dialog, select, table, etc.)
│   │
│   ├── config/                    # Theme and site configuration files
│   ├── controllers/               # Backend controllers extending BaseController
│   ├── hooks/                     # Custom React hooks
│   ├── lib/                       # Singletons: prisma.ts, supabase.js, apiResponse.ts
│   ├── middlewares/               # Route guards: withAuth.ts, withRole.ts, withErrorHandler.ts
│   ├── models/                    # Database query layer extending BaseModel
│   ├── services/                  # Server-side business logic (auth.service, payment.service, storage.service)
│   ├── services-client/           # Client HTTP API wrappers extending BaseApiService
│   ├── store/                     # Redux Toolkit store and slices (auth, cart, product, theme)
│   ├── types/                     # TypeScript definitions for entities (product, order, etc.)
│   └── utils/                     # Helper functions: cn.ts, formatCurrency.ts, generateSku.ts
│
├── supabase/
│   └── migrations/
│       └── 0001_init.sql          # Base PostgreSQL schema, tables, indexes, and RLS policies
├── .env.example                   # Environment variable template
├── components.json                # shadcn/ui configuration
├── package.json                   # Dependencies & npm scripts
├── tailwind.config.ts             # Tailwind design tokens and animations
└── tsconfig.json                  # TypeScript compiler settings & path aliases (@/* -> ./src/*)
```

---

## 4. Database Schema & Core Entities

The database uses PostgreSQL managed via Prisma and Supabase.

### Entity Relationship Model

```
 ┌──────────────┐
 │   Category   │◄───┐ (Self-referencing parent/child tree)
 └──────┬───────┘    │
        │ 1:N        │
 ┌──────▼───────┐    │
 │   Product    │────┘
 └──────┬───────┘
        │ 1:N
 ┌──────▼───────┐         1:N       ┌──────────────┐
 │  OptionType  ├──────────────────►│ OptionValue  │
 └──────────────┘                   └──────┬───────┘
                                           │
 ┌──────────────┐         1:N              │ M:N
 │   Variant    ├──────────────────────────┤
 └──────┬───────┘ (via VariantOptionValue) │
        │
        ├───────────────────────────┐
        │ 1:N                       │ 1:N
 ┌──────▼───────┐            ┌──────▼───────┐
 │   CartItem   │            │  OrderItem   │
 └──────┬───────┘            └──────┬───────┘
        │                           │
        │ N:1                       │ N:1
 ┌──────▼───────┐            ┌──────▼───────┐
 │   Profile    │            │    Order     │
 │ (Auth User)  │◄───────────┤              │
 └──────────────┘   (buyer)  └──────────────┘
```

### Key Models
1. **Product**: Parent product entity (title, brand, description, category, base images).
2. **OptionType & OptionValue**: Flexible product attributes (e.g., OptionType: `Color`, OptionValues: `["Red", "Blue"]`).
3. **Variant**: Sellable SKU (price, promo price, stock quantity, SKU code, image). Connected to options via `VariantOptionValue`.
4. **CartItem**: User's cart items linked to a specific `Variant` and `userId`.
5. **Order & OrderItem**: Order tracking with total amount, status (`pending`, `paid`, `shipped`, `delivered`, `cancelled`), shipping address JSON, and historical price snapshot.
6. **Profile**: User account holding credentials, full name, and role (`customer` | `admin`).

---

## 5. Critical Engineering Details & Conventions

### A. BigInt & Decimal Serialization
PostgreSQL `bigint` (IDs) and `numeric` (currency) types in Prisma return JavaScript `BigInt` and `Decimal` instances. Standard `JSON.stringify()` throws an error when serializing `BigInt`.
- **Solution**: [`BaseModel`](file:///c:/shoaib%20workspace/store-app/src/models/base.model.ts) implements automatic recursive conversion (`toSnakeCase`) converting `BigInt` to safe integers/strings and `Decimal` to `number`.
- **Always inherit from `BaseModel`** when creating new models to ensure data is safely transformed.

### B. Standard API Response Envelope
All API controllers inherit from [`BaseController`](file:///c:/shoaib%20workspace/store-app/src/controllers/base.controller.ts) and return a standardized structure:
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100
  }
}
```
Errors return:
```json
{
  "success": false,
  "message": "Error description"
}
```

### C. Client API Services
Frontend components should **not** make ad-hoc `fetch()` calls. Instead, use or extend [`BaseApiService`](file:///c:/shoaib%20workspace/store-app/src/services-client/baseApiService.ts):
```ts
// Example: src/services-client/product.service.ts
export class ProductService extends BaseApiService<Product> {
  constructor() {
    super("products");
  }
  // Base gives you list(), getById(), create(), update(), remove()
}
export const productService = new ProductService();
```

### D. Authentication & Role Guards
Authentication is handled via JWT tokens stored in both cookies and authorization headers (`Bearer <token>`).
- To protect a customer API route:
  ```ts
  const user = await withAuth(req);
  if (user instanceof NextResponse) return user; // 401 Unauthorized
  ```
- To protect an admin API route:
  ```ts
  const guard = await withRole(["admin"])(req);
  if (guard instanceof NextResponse) return guard; // 401 or 403 Forbidden
  ```

---

## 6. Getting Started (Local Setup Guide)

Follow these steps to set up the project from scratch on your local machine:

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Create `.env.local` in the project root:
```env
# Database Connections (from Supabase Project Settings -> Database)
DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres"

# Authentication
JWT_SECRET="your-super-secure-random-jwt-secret"

# Supabase Public Credentials (for Storage / Client SDK)
NEXT_PUBLIC_SUPABASE_URL="https://[PROJECT-REF].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"
```

### 3. Initialize Database
1. Open your Supabase SQL Editor and run the migration file:
   [`supabase/migrations/0001_init.sql`](file:///c:/shoaib%20workspace/store-app/supabase/migrations/0001_init.sql)
2. Generate the Prisma Client locally:
   ```bash
   npx prisma generate
   ```

### 4. Create an Admin Account
1. Start the development server (`npm run dev`).
2. Navigate to `http://localhost:3000/register` and sign up.
3. In your database (Supabase table editor or SQL), update your user's role from `"customer"` to `"admin"`:
   ```sql
   UPDATE profiles SET role = 'admin' WHERE email = 'your-email@example.com';
   ```
4. Log out and log in again to access the Admin Panel at `/admin/dashboard`.

### 5. Run Dev Server
```bash
npm run dev
```
- Storefront: `http://localhost:3000`
- Admin Panel: `http://localhost:3000/admin/dashboard`
- Login / Register: `http://localhost:3000/login`

---

## 7. Common Development Workflows

### Creating a New Feature (End-to-End)
When adding a new entity (e.g., `Reviews`):
1. **Schema**: Add the model in `prisma/schema.prisma` and run `npx prisma generate`.
2. **Model**: Create `src/models/review.model.ts` extending `BaseModel<Review>`.
3. **Controller**: Create `src/controllers/review.controller.ts` extending `BaseController<Review>`.
4. **API Route**: Create `src/app/api/reviews/route.ts` and `src/app/api/reviews/[id]/route.ts`.
5. **Client Service**: Create `src/services-client/review.service.ts` extending `BaseApiService<Review>`.
6. **UI Component**: Build UI in `src/components/features/...` using shadcn primitives and hook into the client service or Redux.

---

## 8. Troubleshooting & FAQ

| Problem | Cause | Solution |
| :--- | :--- | :--- |
| `Cannot find module '@/generated/client'` | Prisma client has not been generated yet | Run `npx prisma generate`. |
| `TypeError: Do not know how to serialize a BigInt` | Raw Prisma object passed directly to `NextResponse.json` | Use model methods inheriting `BaseModel` which runs `toSnakeCase()` to convert BigInts to safe numbers. |
| Admin layout redirects to homepage | Logged-in user is not marked as `admin` | Update user record in `profiles` table: `SET role = 'admin'`. |
| Product image upload fails | Supabase storage bucket not configured | Ensure a public bucket named `products` is created in Supabase with upload permissions. |
