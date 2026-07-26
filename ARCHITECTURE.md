# Architecture — Dungeon API v1

> Single source of truth for the backend REST API architecture, directory structure, database design, API contracts, and deployment strategy.

---

## Table of Contents

1. [Overview & Goals](#1-overview--goals)
2. [Monorepo Layout](#2-monorepo-layout)
3. [Architecture Pattern](#3-architecture-pattern)
4. [Database Design](#4-database-design)
5. [API Design](#5-api-design)
6. [Validation Strategy](#6-validation-strategy)
7. [Error Handling](#7-error-handling)
8. [Request Lifecycle](#8-request-lifecycle)
9. [Deployment](#9-deployment)
10. [Conventions](#10-conventions)

---

## 1. Overview & Goals

Dungeon API v1 is a practice backend REST API built with Node.js and Express. It provides full CRUD functionality for a generic "items" resource, with pagination, query parameter filtering, and Zod-based input validation. The API is deployed as Vercel serverless functions.

### Core Objectives

- **Full CRUD** — Create, Read, Update (full & partial), Delete for an `items` resource
- **Pagination** — Cursor-free page/limit pagination with metadata
- **Query filtering** — Search by text, filter by category, filter by price range
- **Validation** — Zod schemas for request body, query parameters, and path parameters
- **Deployment** — Running as Vercel serverless functions, no dedicated server

### Tech Stack

| Layer          | Technology                 | Purpose                          |
|----------------|----------------------------|----------------------------------|
| Runtime        | Node.js (ESM)              | JavaScript runtime               |
| Framework      | Express v5                 | HTTP routing & middleware         |
| Validation     | Zod                        | Runtime schema validation         |
| Database       | SQLite (better-sqlite3)    | Local file-based persistence      |
| Linting        | oxlint                     | Code quality                     |
| Deployment     | Vercel                     | Serverless hosting               |
| Testing        | Vitest + Supertest         | Unit & integration tests          |

> **Note:** The frontend (`src/`) is a React + Vite app with Tailwind CSS and an Adobe-inspired design system. It exists in this repo but is **not** the focus of this architecture document.

---

## 2. Monorepo Layout

The backend API and React frontend share a single repository. Vercel treats the `api/` directory as the serverless functions root, while `src/` remains the Vite frontend source.

```
dungeon-api-v1/
│
├── api/                              # ─── BACKEND (Vercel serverless) ───
│   ├── v1/
│   │   ├── items.js                  # GET (list) + POST /api/v1/items
│   │   ├── items/
│   │   │   └── [id].js               # GET + PUT + PATCH + DELETE /api/v1/items/:id
│   │   └── health.js                 # GET /api/v1/health
│   └── _lib/
│       ├── db.js                     # SQLite connection + schema initialization
│       ├── validate.js               # Zod validation middleware
│       └── error-handler.js          # Global error handler + async wrapper
│
├── lib/                              # ─── SHARED CODE ───
│   └── schemas/
│       └── item.schema.js            # Zod schemas for Item resource
│
├── scripts/
│   └── seed.js                       # Database seed script (~50 sample items)
│
├── src/                              # ─── FRONTEND (React + Vite) ───
│   ├── main.jsx                      # React entry point
│   ├── App.jsx                       # Router + lazy-loaded routes
│   ├── index.css                     # Tailwind v4 + Adobe design tokens
│   └── pages/
│       └── Home.jsx                  # Home page
│
├── vercel.json                       # Vercel routing config
├── package.json                      # Dependencies & scripts
├── vite.config.js                    # Vite build config
├── tailwind.config.js                # Tailwind theme
├── .oxlintrc.json                    # Linter config
├── .gitignore
├── DESIGN.md                         # Adobe design system tokens
└── ARCHITECTURE.md                   # This file
```

### Directory Responsibilities

| Directory         | Purpose                                                        |
|-------------------|----------------------------------------------------------------|
| `api/v1/`         | Route handlers — one file per route segment                    |
| `api/_lib/`       | Shared serverless utilities (DB, validation, error handling)    |
| `lib/schemas/`    | Zod schema definitions (shared between API and potentially frontend) |
| `scripts/`        | Offline tooling (seeding, migrations)                           |
| `src/`            | React frontend (existing, not modified by this project phase)   |

---

## 3. Architecture Pattern

### Simplified Layered Architecture

This project uses a **3-layer architecture** — appropriate for a single-resource practice API. The full enterprise pattern (controller → service → repository) is intentionally omitted to keep complexity proportional to scope.

```
┌─────────────────────────────────────────────┐
│              HTTP LAYER                      │
│  api/v1/items.js, items/[id].js, health.js  │
│  Handles requests, responses, status codes   │
├─────────────────────────────────────────────┤
│            VALIDATION LAYER                  │
│  lib/schemas/item.schema.js                  │
│  api/_lib/validate.js (middleware)           │
│  Zod schemas validate body, query, params    │
├─────────────────────────────────────────────┤
│             DATA LAYER                       │
│  api/_lib/db.js                              │
│  better-sqlite3 queries, schema init         │
└─────────────────────────────────────────────┘
```

**Why not controller/service/repository?**

- Single resource (`items`) — no business logic to isolate
- No authentication or authorization — no cross-cutting concerns
- Practice project — layers would add navigation overhead without educational value
- If the project grows, extract a service layer between HTTP and Data

---

## 4. Database Design

### Driver: better-sqlite3

- **Synchronous API** — no async/await needed for DB calls, simpler code
- **Zero configuration** — file-based, no server process
- **Fast** — native C binding, significantly faster than async alternatives for small datasets
- **Tradeoff** — blocks the event loop (acceptable for a practice API with low traffic)

### Schema

```sql
CREATE TABLE IF NOT EXISTS items (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT    NOT NULL,
    description TEXT,
    category    TEXT    NOT NULL DEFAULT 'general',
    price       REAL    NOT NULL DEFAULT 0,
    inStock     INTEGER NOT NULL DEFAULT 1,
    createdAt   TEXT    NOT NULL DEFAULT (datetime('now')),
    updatedAt   TEXT    NOT NULL DEFAULT (datetime('now'))
);
```

### Column Reference

| Column      | Type    | Constraints                         | Notes                              |
|-------------|---------|-------------------------------------|-------------------------------------|
| `id`        | INTEGER | PRIMARY KEY AUTOINCREMENT           | Auto-generated, immutable           |
| `name`      | TEXT    | NOT NULL                            | Item display name                   |
| `description` | TEXT  |                                     | Optional long description           |
| `category`  | TEXT    | NOT NULL DEFAULT `'general'`        | Filterable category tag             |
| `price`     | REAL    | NOT NULL DEFAULT `0`                | Decimal price value                 |
| `inStock`   | INTEGER | NOT NULL DEFAULT `1`                | Boolean (1 = true, 0 = false)       |
| `createdAt` | TEXT    | NOT NULL DEFAULT `datetime('now')`  | ISO 8601 UTC timestamp              |
| `updatedAt` | TEXT    | NOT NULL DEFAULT `datetime('now')`  | Updated on PUT/PATCH                |

### Vercel Ephemeral Storage

Vercel serverless functions are **stateless** — the SQLite file stored at the default path will not persist between cold starts. Two mitigation strategies:

1. **Use `/tmp` directory** — persists within a single function instance's lifecycle (seconds to minutes). Data resets on cold start. Acceptable for practice.
2. **Seed on cold start** — the `db.js` module runs the seed script if the `items` table is empty, ensuring data is always available.

---

## 5. API Design

### Route Table

| Method   | Path                    | Description              | Status Codes       |
|----------|-------------------------|--------------------------|--------------------|
| `GET`    | `/api/v1/health`        | Health check             | 200                |
| `GET`    | `/api/v1/items`         | List items (paginated)   | 200                |
| `POST`   | `/api/v1/items`         | Create a new item        | 201, 400           |
| `GET`    | `/api/v1/items/:id`     | Get a single item        | 200, 404           |
| `PUT`    | `/api/v1/items/:id`     | Full update an item      | 200, 400, 404      |
| `PATCH`  | `/api/v1/items/:id`     | Partial update an item   | 200, 400, 404      |
| `DELETE` | `/api/v1/items/:id`     | Delete an item           | 204, 404           |

### Query Parameters — `GET /api/v1/items`

| Parameter  | Type    | Default       | Description                              |
|------------|---------|---------------|------------------------------------------|
| `page`     | integer | `1`           | Page number (1-indexed)                  |
| `limit`    | integer | `10`          | Items per page (max: 100)                |
| `sortBy`   | string  | `"createdAt"` | Field to sort by                         |
| `order`    | string  | `"desc"`      | Sort direction: `asc` or `desc`          |
| `search`   | string  | —             | Free-text search on `name` and `description` |
| `category` | string  | —             | Filter by exact category match           |
| `minPrice` | number  | —             | Minimum price (inclusive)                |
| `maxPrice` | number  | —             | Maximum price (inclusive)                |

### Response Envelope

All responses follow a consistent JSON structure. **Successful:**

```jsonc
// Single resource
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Iron Shield",
    "description": "A sturdy iron shield",
    "category": "armor",
    "price": 25.50,
    "inStock": true,
    "createdAt": "2026-07-26T10:00:00.000Z",
    "updatedAt": "2026-07-26T10:00:00.000Z"
  }
}

// Paginated list
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "totalPages": 5
  }
}
```

**Error:**

```jsonc
{
  "success": false,
  "error": {
    "message": "Validation failed",
    "details": [
      { "field": "body.name", "message": "Required" },
      { "field": "body.price", "message": "Expected number, received string" }
    ]
  }
}
```

### Boolean Convention

SQLite stores booleans as integers (`0`/`1`). The API response converts these to actual booleans (`false`/`true`) in the JSON output. The `inStock` field in the database is `INTEGER`, but the API returns `boolean`.

---

## 6. Validation Strategy

### Zod Schemas

All validation schemas live in `lib/schemas/item.schema.js`. They define the shape and constraints for every incoming request.

```js
// lib/schemas/item.schema.js
import { z } from "zod";

export const createItemSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Name is required").max(100),
    description: z.string().max(500).optional(),
    category: z.string().min(1).max(50).default("general"),
    price: z.number().min(0, "Price must be non-negative"),
    inStock: z.boolean().default(true),
  }),
});

export const updateItemSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, "ID must be a numeric string"),
  }),
  body: z.object({
    name: z.string().min(1).max(100).optional(),
    description: z.string().max(500).optional(),
    category: z.string().min(1).max(50).optional(),
    price: z.number().min(0).optional(),
    inStock: z.boolean().optional(),
  }).refine(
    (data) => Object.keys(data).length > 0,
    { message: "At least one field must be provided for update" }
  ),
});

export const itemIdSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, "ID must be a numeric string"),
  }),
});

export const listQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
    sortBy: z.enum(["id", "name", "price", "category", "createdAt", "updatedAt"])
      .default("createdAt"),
    order: z.enum(["asc", "desc"]).default("desc"),
    search: z.string().max(100).optional(),
    category: z.string().max(50).optional(),
    minPrice: z.coerce.number().min(0).optional(),
    maxPrice: z.coerce.number().min(0).optional(),
  }),
});
```

### Validation Middleware

Zod schemas are enforced via Express middleware applied at the route level.

```js
// api/_lib/validate.js
import { ZodError } from "zod";

export function validate(schema) {
  return (req, res, next) => {
    try {
      const result = schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      // Attach parsed/validated values (with defaults applied)
      if (result.query) req.query = result.query;
      if (result.body) req.body = result.body;
      if (result.params) req.params = result.params;

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const details = error.errors.map((e) => ({
          field: e.path.join("."),
          message: e.message,
        }));
        return res.status(400).json({
          success: false,
          error: { message: "Validation failed", details },
        });
      }
      next(error);
    }
  };
}
```

### What Gets Validated Per Route

| Route                   | Body | Query | Params |
|-------------------------|------|-------|--------|
| `GET /items`            | —    | `listQuerySchema` | — |
| `POST /items`           | `createItemSchema.body` | — | — |
| `GET /items/:id`        | —    | — | `itemIdSchema.params` |
| `PUT /items/:id`        | `updateItemSchema.body` | — | `updateItemSchema.params` |
| `PATCH /items/:id`      | `updateItemSchema.body` | — | `updateItemSchema.params` |
| `DELETE /items/:id`     | —    | — | `itemIdSchema.params` |

---

## 7. Error Handling

### Error Response Shape

All errors returned by the API follow a consistent structure:

```jsonc
{
  "success": false,
  "error": {
    "message": "Human-readable error description",
    "details": []   // Optional: array of field-level errors (for validation)
  }
}
```

### Global Error Handler

```js
// api/_lib/error-handler.js

/**
 * Maps known error types to HTTP responses.
 * Unknown errors return 500 with a generic message.
 */
export function errorHandler(err, req, res, _next) {
  // Zod validation errors (caught by validate middleware, but as a safety net)
  if (err.name === "ZodError") {
    return res.status(400).json({
      success: false,
      error: {
        message: "Validation failed",
        details: err.errors.map((e) => ({
          field: e.path.join("."),
          message: e.message,
        })),
      },
    });
  }

  // better-sqlite3 constraint errors (e.g., NOT NULL violation)
  if (err.code === "SQLITE_CONSTRAINT") {
    return res.status(400).json({
      success: false,
      error: { message: "Database constraint violation", details: err.message },
    });
  }

  // Unexpected errors — do not leak internals in production
  console.error("[ERROR]", err);
  res.status(500).json({
    success: false,
    error: { message: "Internal server error" },
  });
}

/**
 * Wraps async route handlers to forward errors to the global handler.
 * Eliminates the need for try/catch in every route.
 */
export function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
```

### 404 Catch-All

Any request that doesn't match a defined route returns a 404:

```jsonc
// Returned by Express when no route matches
{
  "success": false,
  "error": { "message": "Route not found: GET /api/v1/unknown" }
}
```

### Error Status Code Map

| Condition                          | Status Code | Message                                |
|------------------------------------|-------------|----------------------------------------|
| Zod validation failure             | 400         | `"Validation failed"` + details array  |
| SQLite constraint violation        | 400         | `"Database constraint violation"`      |
| Item not found by ID               | 404         | `"Item not found"`                     |
| Unknown route                      | 404         | `"Route not found: {METHOD} {PATH}"`   |
| Unexpected server error            | 500         | `"Internal server error"`              |

---

## 8. Request Lifecycle

### Flow Diagram

```
Client Request (e.g. POST /api/v1/items)
  │
  ▼
┌──────────────────┐
│  CORS Middleware  │  ← Allows cross-origin requests (configurable origin)
└────────┬─────────┘
         ▼
┌──────────────────┐
│  Body Parser      │  ← express.json({ limit: "10kb" })
└────────┬─────────┘
         ▼
┌──────────────────┐
│  Request Logger   │  ← Logs method, path, status, duration
└────────┬─────────┘
         ▼
┌──────────────────┐
│  Route Matching   │  ← Express matches /api/v1/items or /api/v1/items/:id
└────────┬─────────┘
         ▼
┌──────────────────┐
│  Zod Validation   │  ← Validates body, query, and/or params per route schema
└────────┬─────────┘
         │
    ┌────┴────┐
    │         │
  FAIL     PASS
    │         │
    ▼         ▼
  400       ┌──────────────────┐
  JSON      │  Route Handler    │  ← Business logic: DB queries, response building
            └────────┬─────────┘
                     │
              ┌──────┴──────┐
              │             │
           SUCCESS       ERROR
              │             │
              ▼             ▼
         ┌──────────┐  ┌──────────────┐
         │ 2xx JSON  │  │ Error Handler │  ← Maps error type → status code + message
         │ Envelope  │  └──────┬───────┘
         └──────────┘         │
                              ▼
                        Error JSON
                        Envelope
```

### Error Interception Points

1. **CORS** — rejects with 403 if origin is not allowed (rare, usually in dev)
2. **Body Parser** — rejects with 400 if JSON is malformed
3. **Validation Middleware** — rejects with 400 + field-level details
4. **Route Handler** — can throw or call `next(error)` on DB failures
5. **Global Error Handler** — catches everything that reaches it, returns 500

---

## 9. Deployment

### Vercel Configuration

```json
// vercel.json
{
  "version": 2,
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/api" }
  ],
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "no-store" }
      ]
    }
  ]
}
```

### How Vercel Maps Files to Endpoints

Vercel's file-based routing maps `api/` files to HTTP endpoints:

| File                          | Endpoint                    |
|-------------------------------|-----------------------------|
| `api/v1/health.js`           | `GET /api/v1/health`        |
| `api/v1/items.js`            | `GET/POST /api/v1/items`    |
| `api/v1/items/[id].js`       | `GET/PUT/PATCH/DELETE /api/v1/items/:id` |

Each file exports handler functions named after HTTP methods (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`).

### SQLite on Vercel

```
┌─────────────────────────────────────────────┐
│  Vercel Serverless Function (cold start)    │
│                                             │
│  1. Module loads                            │
│  2. db.js initializes SQLite at /tmp/items.db │
│  3. If table empty → runs seed script       │
│  4. Handles request                         │
│  5. Function freezes / terminates           │
│                                             │
│  ⚠ /tmp persists only within the same       │
│    function instance lifecycle              │
└─────────────────────────────────────────────┘
```

**Mitigation:** The `db.js` module includes a `seedIfEmpty()` check. On every cold start, if the `items` table has 0 rows, the seed script runs and populates ~50 sample items. This ensures the API always returns data, even though the database is ephemeral.

### Environment Variables

| Variable         | Value              | Notes                          |
|------------------|--------------------|--------------------------------|
| `NODE_ENV`       | `production`       | Set by Vercel automatically    |
| `DATABASE_PATH`  | `/tmp/items.db`    | Override for custom DB path    |

---

## 10. Conventions

### Module System

- **ES Modules** — `"type": "module"` in `package.json`
- All imports use `import`/`export` syntax, no `require()`
- File extensions required in imports: `import { x } from "./file.js"`

### File Naming

- **`kebab-case.js`** for all files: `item.schema.js`, `error-handler.js`
- **`[id].js`** for dynamic Vercel routes (bracket notation)
- Directory names: `lowercase` (`api`, `lib`, `_lib`, `schemas`)

### Response Format

- **Always** return the envelope pattern: `{ success, data, error, pagination }`
- **Never** return raw arrays or objects — even single-resource endpoints wrap in `{ success: true, data: { ... } }`
- **Boolean fields** in DB (`inStock` as `0`/`1`) are converted to `true`/`false` in JSON responses

### Validation

- **Zod is the single source of truth** for input shape — no manual validation checks
- **Validation runs before the route handler** via middleware, not inside it
- **Parsed values replace originals** on `req.body`/`req.query`/`req.params` (defaults applied, types coerced)

### Linting

- **oxlint** — configured via `.oxlintrc.json`
- Run `npm run lint` before committing
- No TypeScript — runtime validation via Zod replaces compile-time checks

### Error Handling

- **Use `asyncHandler()`** to wrap all async route handlers — eliminates repetitive try/catch
- **Never throw raw `Error` objects** — always call `next(error)` or return a response
- **Log unexpected errors** to `console.error` — never to the client in production
