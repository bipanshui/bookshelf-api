# Bookshelf API

A small Node.js + TypeScript API for managing books in PostgreSQL with Express and Prisma ORM.

## Stack

- Node.js
- TypeScript
- Express
- PostgreSQL
- Prisma ORM
- Redis with `ioredis`

## Project Structure

```text
src/
  config/
    db.ts
    redis.ts
  controllers/
    book-controller.ts
  models/
    book-model.ts
  routes/
    book-routes.ts
  services/
    book-service.ts
  index.ts
prisma/
  schema.prisma
initial_payload.json
```

## Requirements

- Node.js 18+
- npm
- A PostgreSQL database
- Redis running locally on port `6379` if you plan to use the Redis client

## Environment Variables

Create a `.env` file in the project root:

```env
DATABASE_URL=postgresql://bipanshu:password@127.0.0.1:5432/bookshelf
PORT=3000
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
POSTGRES_DB=bookshelf
POSTGRES_USER=bipanshu
POSTGRES_PASSWORD=password
```

Notes:

- `DATABASE_URL` is required.
- `PORT` is optional. The app defaults to `3000`.
- `REDIS_HOST` is optional. The app defaults to `127.0.0.1`.
- `REDIS_PORT` is optional. The app defaults to `6379`.
- `POSTGRES_DB`, `POSTGRES_USER`, and `POSTGRES_PASSWORD` are only used by [`docker-compose.yml`](/home/bipanshu/Devops_labs/projects/bookshelf-api/docker-compose.yml) when you run Postgres locally in Docker.

Your current `.env` points to a remote Neon database. If you want the API to use a Postgres container running on the same machine, replace `DATABASE_URL` with a local connection string like:

```env
DATABASE_URL=postgresql://bipanshu:password@127.0.0.1:5432/bookshelf
```

## Install

```bash
npm install
npm run prisma:generate
```

Sync the Prisma schema to your database:

```bash
npm run prisma:push
```

## Local Containers

[`docker-compose.yml`](/home/bipanshu/Devops_labs/projects/bookshelf-api/docker-compose.yml) starts both Postgres and Redis on the same machine with host ports exposed:

```bash
docker compose up -d
```

That gives you:

- Postgres on `127.0.0.1:5432`
- Redis on `127.0.0.1:6379`

After the containers are healthy, point `DATABASE_URL` in `.env` to the local Postgres instance and run:

```bash
npm run prisma:push
```

If you want to inspect container status:

```bash
docker compose ps
```

## Initial Seed

The project now includes [`initial_payload.json`](/home/bipanshu/Devops_labs/projects/bookshelf-api/initial_payload.json) with 100 books.

On startup, the API checks the `books` table:

- If the table is empty, it loads the JSON payload once.
- If any books already exist, it skips seeding.

That means the seed runs automatically for a fresh database, but not on every restart.

## Run

Development:

```bash
npm run dev
```

Build:

```bash
npm run build
```

Production:

```bash
npm start
```

## Available Endpoints

### `GET /`

Health-style root route.

Response:

```text
BookShelf API running ...
```

### `GET /books`

Fetch all books from the `books` table through Prisma.

Example:

```bash
curl http://localhost:3000/books
```

### `GET /books/search`

Search books with combined pagination, filtering, and sorting.

Example:

```bash
curl "http://localhost:3000/books/search?page=1&limit=5&search=atlas&author=nina&sort_by=created_at&order=desc"
```

Useful test calls now:

```bash
curl "http://localhost:3000/books/search?page=1&limit=10"
curl "http://localhost:3000/books/search?page=2&limit=10&sort_by=title&order=asc"
curl "http://localhost:3000/books/search?page=1&limit=5&author=Mercer"
curl "http://localhost:3000/books/search?page=1&limit=8&published_year=1975"
curl "http://localhost:3000/books/search?page=1&limit=10&search=orchard"
```

Response shape:

```json
{
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 5,
    "totalItems": 0,
    "totalPages": 0,
    "hasNextPage": false,
    "hasPreviousPage": false
  },
  "filters": {
    "author": "nina",
    "search": "atlas",
    "sort_by": "created_at",
    "order": "desc"
  }
}
```

## Database

Prisma is configured in [schema.prisma](/home/bipanshu/Devops_labs/projects/bookshelf-api/prisma/schema.prisma), and the shared Prisma client is initialized in [db.ts](/home/bipanshu/Devops_labs/projects/bookshelf-api/src/config/db.ts).

Current Prisma model:

- `Book.id`
- `Book.title`
- `Book.author`
- `Book.publishedYear`
- `Book.createdAt`

If `DATABASE_URL` is missing, the app throws an error at startup.

## Redis

Redis is initialized in [`src/config/redis.ts`](/home/bipanshu/Devops_labs/projects/bookshelf-api/src/config/redis.ts).

The API now caches these read endpoints:

- `GET /books`
- `GET /books/search`
- `GET /books/:id`

Cache entries use the `books:*` namespace with a 5 minute TTL.

Any successful `POST`, bulk `POST`, `PUT`, or `DELETE` against `/books` invalidates that namespace so list, search, and single-book reads stay consistent.

## Suggested Next Steps

- Add centralized error handling middleware
- Add tests for routes and services
- Add metrics for cache hit rate and invalidation frequency
