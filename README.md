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
```

## Requirements

- Node.js 18+
- npm
- A PostgreSQL database
- Redis running locally on port `6379` if you plan to use the Redis client

## Environment Variables

Create a `.env` file in the project root:

```env
DATABASE_URL=your_postgres_connection_string
PORT=3000
```

Notes:

- `DATABASE_URL` is required.
- `PORT` is optional. The app defaults to `3000`.

## Install

```bash
npm install
npm run prisma:generate
```

Sync the Prisma schema to your database:

```bash
npm run prisma:push
```

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

At the moment, the Redis client exists but is not yet used by the books endpoints.

## Current Limitations

- Only read access is implemented for books.
- There is no `POST /books` endpoint yet.
- Request validation is not implemented yet.
- Redis caching is not wired into the API yet.

## Suggested Next Steps

- Add `POST /books`
- Add schema validation for request bodies
- Add centralized error handling middleware
- Use Redis to cache `GET /books`
- Add tests for routes and services
