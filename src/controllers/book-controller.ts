import { Request, Response } from "express";
import { NewBook } from "../models/book-model";
import * as bookService from "../services/book-service";

const isValidNewBook = (value: Partial<NewBook>): value is NewBook => {
  return (
    typeof value.title === "string" &&
    typeof value.author === "string" &&
    typeof value.published_year === "number"
  );
};

export const getAllBooks = async (
  _req: Request,
  res: Response,
): Promise<void> => {
  try {
    const books = await bookService.getBooks();
    res.status(200).json(books);
  } catch (error) {
    console.error("Failed to fetch books", error);
    res.status(500).json({ message: "Failed to fetch books" });
  }
};

export const createBook = async (
  req: Request<unknown, unknown, Partial<NewBook>>,
  res: Response,
): Promise<void> => {
  if (!isValidNewBook(req.body)) {
    res.status(400).json({
      message: "title, author and published_year are required",
    });
    return;
  }

  try {
    const result = await bookService.createBookIfNotExists(req.body);

    if (!result.created) {
      res.status(409).json({
        message: "Book already exists",
        book: result.book,
      });
      return;
    }

    res.status(201).json(result.book);
  } catch (error) {
    console.error("Failed to create book", error);
    res.status(500).json({ message: "Failed to create book" });
  }
};

export const createBooksBulk = async (
  req: Request<unknown, unknown, unknown>,
  res: Response,
): Promise<void> => {
  if (!Array.isArray(req.body) || req.body.length === 0) {
    res.status(400).json({
      message: "Request body must be a non-empty array of books",
    });
    return;
  }

  const invalidIndex = req.body.findIndex(
    (book) => !isValidNewBook(book as Partial<NewBook>),
  );

  if (invalidIndex !== -1) {
    res.status(400).json({
      message: `Invalid book payload at index ${invalidIndex}`,
    });
    return;
  }

  try {
    const result = await bookService.createBooksBulk(req.body as NewBook[]);
    const createdCount = result.createdBooks.length;
    const existingCount = result.existingBooks.length;

    res.status(201).json({
      message:
        existingCount > 0
          ? "Bulk create completed with existing books skipped"
          : "Bulk create completed successfully",
      createdCount,
      existingCount,
      createdBooks: result.createdBooks,
      existingBooks: result.existingBooks,
    });
  } catch (error) {
    console.error("Failed to create books in bulk", error);
    res.status(500).json({ message: "Failed to create books in bulk" });
  }
};

export const getBook = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      res.status(400).json({ message: "this is an invalid id" });
      return;
    }

    const book = await bookService.getBooksById(id);

    if (!book) {
      res.status(404).json({ message: "book not found" });
      return;
    }

    res.status(200).json(book);
  } catch (error) {
    console.error("Failed to fetch book", error);
    res.status(500).json({ message: "Failed to fetch book" });
  }
};

export const updateBook = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      res.status(400).json({ message: "this is an invalid id" });
      return;
    }

    const updated = await bookService.updateBook(id, req.body);

    if (!updated) {
      res.status(404).json({ message: "book not found" });
      return;
    }

    res.status(200).json(updated);
  } catch (error) {
    console.error("Failed to update book", error);
    res.status(500).json({ message: "Failed to update book" });
  }
};

export const deleteBook = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      res.status(400).json({ message: "this is an invalid id" });
      return;
    }

    const deleted = await bookService.deleteBook(id);

    if (!deleted) {
      res.status(404).json({ message: "book not found" });
      return;
    }

    res.status(200).json(deleted);
  } catch (error) {
    console.error("Failed to delete book", error);
    res.status(500).json({ message: "Failed to delete book" });
  }
};
