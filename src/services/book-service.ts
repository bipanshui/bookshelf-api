import { prisma } from "../config/db";
import { logger } from "../config/logger";
import { redis } from "../config/redis";
import { Prisma } from "../generated/prisma/client";
import {
  Book,
  BookQueryOptions,
  NewBook,
  PaginatedBooksResult,
} from "../models/book-model";

const BOOKS_CACHE_TTL_SECONDS = 300;
const BOOKS_CACHE_PREFIX = "books";

const toBook = (book: {
  id: number;
  title: string;
  author: string;
  publishedYear: number;
  createdAt: Date;
}): Book => ({
  id: book.id,
  title: book.title,
  author: book.author,
  published_year: book.publishedYear,
  created_at: book.createdAt,
});

const hydrateBook = (book: Book): Book => ({
  ...book,
  created_at: new Date(book.created_at),
});

const hydratePaginatedBooksResult = (
  result: PaginatedBooksResult,
): PaginatedBooksResult => ({
  ...result,
  data: result.data.map(hydrateBook),
});

const createCacheKey = (...parts: Array<string | number>): string =>
  `${BOOKS_CACHE_PREFIX}:${parts.join(":")}`;

const isRedisReady = (): boolean => redis.status === "ready";

const getCachedValue = async <T>(
  key: string,
  hydrate?: (value: T) => T,
): Promise<T | null> => {
  if (!isRedisReady()) {
    return null;
  }

  try {
    const cached = await redis.get(key);

    if (!cached) {
      logger.info("Cache miss", { key });
      return null;
    }

    const parsed = JSON.parse(cached) as T;
    logger.info("Cache hit", { key });
    return hydrate ? hydrate(parsed) : parsed;
  } catch (error) {
    logger.warn("Failed to read from Redis cache", { key, error });
    return null;
  }
};

const setCachedValue = async <T>(key: string, value: T): Promise<void> => {
  if (!isRedisReady()) {
    return;
  }

  try {
    await redis.set(key, JSON.stringify(value), "EX", BOOKS_CACHE_TTL_SECONDS);
    logger.info("Cache set", { key, ttlSeconds: BOOKS_CACHE_TTL_SECONDS });
  } catch (error) {
    logger.warn("Failed to write to Redis cache", { key, error });
  }
};

const invalidateBooksCache = async (): Promise<void> => {
  if (!isRedisReady()) {
    return;
  }

  try {
    let cursor = "0";

    do {
      const [nextCursor, keys] = await redis.scan(
        cursor,
        "MATCH",
        `${BOOKS_CACHE_PREFIX}:*`,
        "COUNT",
        100,
      );

      cursor = nextCursor;

      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } while (cursor !== "0");

    logger.info("Books cache invalidated");
  } catch (error) {
    logger.warn("Failed to invalidate books cache", { error });
  }
};

const createBookRecord = async (newBook: NewBook): Promise<Book> => {
  const createdBook = await prisma.book.create({
    data: {
      title: newBook.title,
      author: newBook.author,
      publishedYear: newBook.published_year,
    },
  });

  return toBook(createdBook);
};

export const createBook = async (newBook: NewBook): Promise<Book> => {
  const createdBook = await createBookRecord(newBook);
  await invalidateBooksCache();
  return createdBook;
};

export const findExistingBook = async (
  book: NewBook,
): Promise<Book | null> => {
  const existingBook = await prisma.book.findUnique({
    where: {
      title_author_publishedYear: {
        title: book.title,
        author: book.author,
        publishedYear: book.published_year,
      },
    },
  });

  return existingBook ? toBook(existingBook) : null;
};

export const createBookIfNotExists = async (
  newBook: NewBook,
): Promise<{ book: Book; created: boolean }> => {
  const existingBook = await findExistingBook(newBook);

  if (existingBook) {
    return { book: existingBook, created: false };
  }

  const createdBook = await createBookRecord(newBook);
  await invalidateBooksCache();
  return { book: createdBook, created: true };
};

export const createBooksBulk = async (
  newBooks: NewBook[],
): Promise<{
  createdBooks: Book[];
  existingBooks: Book[];
}> => {
  const createdBooks: Book[] = [];
  const existingBooks: Book[] = [];

  for (const book of newBooks) {
    const existingBook = await findExistingBook(book);

    if (existingBook) {
      existingBooks.push(existingBook);
      continue;
    }

    createdBooks.push(await createBookRecord(book));
  }

  if (createdBooks.length > 0) {
    await invalidateBooksCache();
  }

  return {
    createdBooks,
    existingBooks,
  };
};

export const getBooks = async (): Promise<Book[]> => {
  const cacheKey = createCacheKey("all");
  const cachedBooks = await getCachedValue<Book[]>(cacheKey, (books) =>
    books.map(hydrateBook),
  );

  if (cachedBooks) {
    return cachedBooks;
  }

  const books = await prisma.book.findMany({
    orderBy: {
      id: "asc",
    },
  });

  const result = books.map(toBook);
  await setCachedValue(cacheKey, result);
  return result;
};

const sortByToPrismaField = (
  sortBy: BookQueryOptions["sort_by"],
): "id" | "title" | "author" | "publishedYear" | "createdAt" => {
  switch (sortBy) {
    case "published_year":
      return "publishedYear";
    case "created_at":
      return "createdAt";
    default:
      return sortBy;
  }
};

export const getBooksWithQuery = async (
  options: BookQueryOptions,
): Promise<PaginatedBooksResult> => {
  const { page, limit, author, published_year, search, sort_by, order } = options;
  const cacheKey = createCacheKey("search", JSON.stringify(options));

  const cachedResult = await getCachedValue<PaginatedBooksResult>(
    cacheKey,
    hydratePaginatedBooksResult,
  );

  if (cachedResult) {
    return cachedResult;
  }

  const where: Prisma.BookWhereInput = {
    ...(author ? { author: { contains: author, mode: "insensitive" } } : {}),
    ...(published_year !== undefined ? { publishedYear: published_year } : {}),
    ...(search
      ? {
          OR: [
            { title: { contains: search, mode: "insensitive" } },
            { author: { contains: search, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const skip = (page - 1) * limit;
  const [books, totalItems] = await Promise.all([
    prisma.book.findMany({
      where,
      orderBy: {
        [sortByToPrismaField(sort_by)]: order,
      },
      skip,
      take: limit,
    }),
    prisma.book.count({ where }),
  ]);

  const totalPages = totalItems === 0 ? 0 : Math.ceil(totalItems / limit);

  const result = {
    data: books.map(toBook),
    pagination: {
      page,
      limit,
      totalItems,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
    filters: {
      ...(author !== undefined ? { author } : {}),
      ...(published_year !== undefined ? { published_year } : {}),
      ...(search !== undefined ? { search } : {}),
      sort_by,
      order,
    },
  };

  await setCachedValue(cacheKey, result);
  return result;
};

export const getBooksById = async (id: number): Promise<Book | null> => {
  const cacheKey = createCacheKey("id", id);
  const cachedBook = await getCachedValue<Book>(cacheKey, hydrateBook);

  if (cachedBook) {
    return cachedBook;
  }

  const book = await prisma.book.findUnique({
    where: { id },
  });

  if (!book) {
    return null;
  }

  const result = toBook(book);
  await setCachedValue(cacheKey, result);
  return result;
};

export const updateBook = async (
  id: number,
  updatedBook: Partial<NewBook>,
): Promise<Book | null> => {
  const data: Prisma.BookUpdateInput = {};

  if (updatedBook.title !== undefined) {
    data.title = updatedBook.title;
  }

  if (updatedBook.author !== undefined) {
    data.author = updatedBook.author;
  }

  if (updatedBook.published_year !== undefined) {
    data.publishedYear = updatedBook.published_year;
  }

  if (Object.keys(data).length === 0) {
    return getBooksById(id);
  }

  try {
    const updated = await prisma.book.update({
      where: { id },
      data,
    });

    const result = toBook(updated);
    await invalidateBooksCache();
    return result;
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return null;
    }

    throw error;
  }
};

export const deleteBook = async (id: number): Promise<Book | null> => {
  try {
    const deleted = await prisma.book.delete({
      where: { id },
    });

    const result = toBook(deleted);
    await invalidateBooksCache();
    return result;
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return null;
    }

    throw error;
  }
};
