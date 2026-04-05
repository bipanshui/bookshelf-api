import { pool } from "../config/db";
import { Book } from "../models/book-model";

const GET_BOOKS_QUERY = `
  SELECT id, title, author, published_year, created_at
  FROM books
  ORDER BY id ASC
`;




export const getBooks = async (): Promise<Book[]> => {
  const result = await pool.query<Book>(GET_BOOKS_QUERY);
  return result.rows;
};
