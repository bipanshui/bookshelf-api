# Bookshelf API

A small Node.js + TypeScript API for fetching books from PostgreSQL with Express.

## Stack

- Node.js
- TypeScript
- Express
- PostgreSQL with `pg`
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

Fetch all books from the `books` table.

Example:

```bash
curl http://localhost:3000/books
```

## Database

The PostgreSQL pool is configured in [`src/config/db.ts`](/home/bipanshu/Devops_labs/projects/bookshelf-api/src/config/db.ts).

Expected `books` table shape:

- `id`
- `title`
- `author`
- `published_year`
- `created_at`

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
