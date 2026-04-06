import { readFile } from "node:fs/promises";
import path from "node:path";
import { prisma } from "../config/db";
import { logger } from "../config/logger";
import { NewBook } from "../models/book-model";

const INITIAL_PAYLOAD_PATH = path.resolve(__dirname, "../../initial_payload.json");

const isValidBook = (value: unknown): value is NewBook => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.title === "string" &&
    candidate.title.trim().length > 0 &&
    typeof candidate.author === "string" &&
    candidate.author.trim().length > 0 &&
    typeof candidate.published_year === "number" &&
    Number.isInteger(candidate.published_year) &&
    candidate.published_year >= 0
  );
};

const loadInitialPayload = async (): Promise<NewBook[]> => {
  const file = await readFile(INITIAL_PAYLOAD_PATH, "utf-8");
  const parsed = JSON.parse(file) as unknown;

  if (!Array.isArray(parsed) || parsed.length !== 100) {
    throw new Error("initial_payload.json must contain exactly 100 books");
  }

  if (!parsed.every(isValidBook)) {
    throw new Error("initial_payload.json contains invalid book entries");
  }

  return parsed;
};

const ensureBooksTableExists = async (): Promise<void> => {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "books" (
      "id" SERIAL PRIMARY KEY,
      "title" TEXT NOT NULL,
      "author" TEXT NOT NULL,
      "published_year" INTEGER NOT NULL,
      "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "books_title_author_published_year_key"
        UNIQUE ("title", "author", "published_year")
    )
  `);
};

export const seedBooksOnStartup = async (): Promise<void> => {
  await ensureBooksTableExists();

  const existingBooksCount = await prisma.book.count();

  if (existingBooksCount > 0) {
    logger.info("Skipping initial book seed because books already exist", {
      existingBooksCount,
    });
    return;
  }

  const books = await loadInitialPayload();

  await prisma.book.createMany({
    data: books.map((book) => ({
      title: book.title,
      author: book.author,
      publishedYear: book.published_year,
    })),
    skipDuplicates: true,
  });

  logger.info("Initial book payload loaded", { insertedBooks: books.length });
};
