import { Request, Response } from "express";
import * as bookService from "../services/book-service";


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
