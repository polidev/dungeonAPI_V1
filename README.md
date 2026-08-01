# Dungeon API v1

A full-stack REST API and responsive React frontend for managing fantasy RPG dungeons, monsters, items, and characters — built with Express 5, Prisma 7, and React 19 on a SQLite database.

## 🚀 Features

- **Full CRUD** for dungeons, monsters, items, and characters with Zod request validation
- **Search & filter** — query any entity list by name and type/difficulty/class
- **Pagination** — cursor-based page control with configurable limits across all list endpoints
- **Responsive UI** — mobile-first design with burger menu, fluid typography, and 44px touch targets
- **Toast notifications** — success/error feedback for every create, update, and delete action
- **Loading skeletons** — shimmer placeholders for cards, tables, and detail pages
- **Seed script** — pre-loaded with 6 dungeons, 22 monsters, 16 items, and 8 characters
- **Dark mode ready** — full CSS custom property theme with Adobe-inspired color tokens

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, React Router 8, Tailwind CSS 4 |
| Build | Vite 8, React Compiler (Babel), OxLint |
| Backend | Express 5, Zod 4 |
| Database | SQLite via better-sqlite3, Prisma 7 |
| Tooling | Node.js 18+, ES Modules |

## 📦 Prerequisites

- **Node.js** v18 or later
- **npm** (comes with Node)

No database server required — SQLite runs as a local file.

## 🔧 Installation & Setup

```bash
# 1. Clone the repository
git clone <repo-url>
cd dungeon-api-v1

# 2. Install dependencies
npm install

# 3. Set up environment variables (copy .env.example to .env)
cp .env.example .env

# 4. Run database migrations
npm run db:migrate

# 5. Seed the database with sample data
npm run db:seed
```

> The `postinstall` script automatically runs `prisma generate` after `npm install`, so the Prisma client is always available.

## 💻 Usage

Start the API server and Vite dev server in separate terminals:

```bash
# Terminal 1 — API server on http://localhost:3000
npm run dev:api

# Terminal 2 — Vite frontend on http://localhost:5173
npm run dev
```

The Vite dev server proxies `/api` requests to the Express backend automatically.

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run dev:api` | Start Express API server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run lint` | Run OxLint |
| `npm run db:migrate` | Run Prisma migrations |
| `npm run db:seed` | Seed database with sample data |
| `npm run db:studio` | Open Prisma Studio (database GUI) |
| `npm run db:reset` | Reset and re-seed database |

### API Endpoints

All routes are prefixed with `/api`.

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | Health check |
| `GET` | `/api/dungeons` | List dungeons (paginated, filterable) |
| `GET` | `/api/dungeons/:id` | Get dungeon with monsters |
| `POST` | `/api/dungeons` | Create dungeon |
| `PUT` | `/api/dungeons/:id` | Update dungeon |
| `DELETE` | `/api/dungeons/:id` | Delete dungeon (cascades monsters) |
| `GET` | `/api/monsters` | List monsters (paginated, filterable) |
| `GET` | `/api/monsters/:id` | Get monster with dungeon |
| `POST` | `/api/monsters` | Create monster |
| `PUT` | `/api/monsters/:id` | Update monster |
| `DELETE` | `/api/monsters/:id` | Delete monster |
| `GET` | `/api/items` | List items (paginated, filterable) |
| `GET` | `/api/items/:id` | Get item with owners |
| `POST` | `/api/items` | Create item |
| `PUT` | `/api/items/:id` | Update item |
| `DELETE` | `/api/items/:id` | Delete item |
| `GET` | `/api/characters` | List characters (paginated, filterable) |
| `GET` | `/api/characters/:id` | Get character with inventory |
| `POST` | `/api/characters` | Create character |
| `PUT` | `/api/characters/:id` | Update character |
| `DELETE` | `/api/characters/:id` | Delete character (cascades inventory) |

### Query Parameters (list endpoints)

| Parameter | Type | Description |
|-----------|------|-------------|
| `page` | number | Page number (default: `1`) |
| `limit` | number | Results per page (default: `10`) |
| `search` | string | Fuzzy name search |
| `type` / `difficulty` / `class` | string | Filter by entity-specific attribute |

### Example Request

```bash
# List hard dungeons, page 2
curl "http://localhost:3000/api/dungeons?page=2&limit=5&difficulty=hard"

# Create a new character
curl -X POST http://localhost:3000/api/characters \
  -H "Content-Type: application/json" \
  -d '{"name":"Aldric","class":"warrior","health":100,"attack":15,"defense":10}'
```

## 📁 Project Structure

```
dungeon-api-v1/
├── api/
│   ├── controllers/      # Request handlers for each resource
│   ├── lib/              # Shared utilities (Prisma client, etc.)
│   ├── middlewares/       # Error handler, pagination, validation
│   ├── routes/           # Express route definitions
│   ├── schemas/          # Zod validation schemas
│   └── index.js          # Express app entry point
├── prisma/
│   ├── migrations/       # Database migration history
│   ├── schema.prisma     # Data models (Dungeon, Monster, Item, Character, Inventory)
│   └── seed.js           # Sample data seeder
├── src/
│   ├── api/client.js     # API client for frontend
│   ├── components/
│   │   ├── layout/       # Navbar, Footer, Layout
│   │   └── ui/           # Button, Input, Select, Badge, Modal, Pagination, etc.
│   ├── context/          # ToastContext provider
│   ├── hooks/            # useFetch, usePagination, useDebounce
│   ├── pages/            # Home, DungeonList/Detail, MonsterList/Detail, etc.
│   ├── index.css         # Theme tokens, fluid typography, Tailwind config
│   ├── App.jsx           # Route definitions with lazy loading
│   └── main.jsx          # React root mount
├── vite.config.js        # Vite config with /api proxy to :3000
└── DESIGN.md             # Adobe-inspired design system documentation
```

## 🤝 Contributing

Contributions are welcome. Fork the repo, create a feature branch, and submit a pull request. Please run `npm run lint` before committing.

## 📄 License

This project is private and not currently licensed for public use.
