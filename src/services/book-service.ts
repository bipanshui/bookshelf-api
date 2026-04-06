import { prisma } from "../config/db";
import { Prisma } from "../generated/prisma/client";
import { Book, NewBook } from "../models/book-model";

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

export const createBook = async (newBook: NewBook): Promise<Book> => {
  const createdBook = await prisma.book.create({
    data: {
      title: newBook.title,
      author: newBook.author,
      publishedYear: newBook.published_year,
    },
  });

  return toBook(createdBook);
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

  const createdBook = await createBook(newBook);
  return { book: createdBook, created: true };
};

export const createBooksBulk = async (
  newBooks: NewBook[],
): Promise<{
  createdBooks: Book[];
  existingBooks: Book[];
}> => {
  const results = await Promise.all(
    newBooks.map((book) => createBookIfNotExists(book)),
  );

  return {
    createdBooks: results.filter((result) => result.created).map((result) => result.book),
    existingBooks: results
      .filter((result) => !result.created)
      .map((result) => result.book),
  };
};


export const getBooks = async (): Promise<Book[]> => {
  const books = await prisma.book.findMany({
    orderBy: {
      id: "asc",
    },
  });

  return books.map(toBook);
};

export const getBooksById = async (id: number): Promise<Book | null> => {
  const book = await prisma.book.findUnique({
    where: { id },
  });

  return book ? toBook(book) : null;
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

    return toBook(updated);
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return null;
    }

    throw error;
  }
}

export const deleteBook = async (id: number): Promise<Book | null> => {
  try {
    const deleted = await prisma.book.delete({
      where: { id },
    });

    return toBook(deleted);
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
