import { Request, Response } from "express";
import { logger } from "../config/logger";
import { NewBook } from "../models/book-model";
import * as bookService from "../services/book-service";

export const getAllBooks = async (
  _req: Request,
  res: Response,
): Promise<void> => {
  try {
    const books = await bookService.getBooks();
    res.status(200).json(books);
  } catch (error) {
    logger.error("Failed to fetch books", { error });
    res.status(500).json({ message: "Failed to fetch books" });
  }
};

export const createBook = async (
  req: Request<unknown, unknown, NewBook>,
  res: Response,
): Promise<void> => {
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
    logger.error("Failed to create book", { error });
    res.status(500).json({ message: "Failed to create book" });
  }
};

export const createBooksBulk = async (
  req: Request<unknown, unknown, NewBook[]>,
  res: Response,
): Promise<void> => {
  try {
    const result = await bookService.createBooksBulk(req.body);
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
    logger.error("Failed to create books in bulk", {
      error,
      payloadSize: req.body.length,
    });
    res.status(500).json({ message: "Failed to create books in bulk" });
  }
};

export const getBook = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);

    const book = await bookService.getBooksById(id);

    if (!book) {
      res.status(404).json({ message: "book not found" });
      return;
    }

    res.status(200).json(book);
  } catch (error) {
    logger.error("Failed to fetch book", { error, id: req.params.id });
    res.status(500).json({ message: "Failed to fetch book" });
  }
};

export const updateBook = async (
  req: Request<{ id: string }, unknown, Partial<NewBook>>,
  res: Response,
): Promise<void> => {
  try {
    const id = Number(req.params.id);

    const updated = await bookService.updateBook(id, req.body);

    if (!updated) {
      res.status(404).json({ message: "book not found" });
      return;
    }

    res.status(200).json(updated);
  } catch (error) {
    logger.error("Failed to update book", { error, id: req.params.id });
    res.status(500).json({ message: "Failed to update book" });
  }
};

export const deleteBook = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const id = Number(req.params.id);

    const deleted = await bookService.deleteBook(id);

    if (!deleted) {
      res.status(404).json({ message: "book not found" });
      return;
    }

    res.status(200).json(deleted);
  } catch (error) {
    logger.error("Failed to delete book", { error, id: req.params.id });
    res.status(500).json({ message: "Failed to delete book" });
  }
};
