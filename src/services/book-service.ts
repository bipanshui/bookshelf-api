import { pool } from "../config/db";
import { Book, NewBook } from "../models/book-model";

const GET_BOOKS_QUERY = `
  SELECT id, title, author, published_year, created_at
  FROM books
  ORDER BY id ASC
`;

export const createBook = async (newBook: NewBook): Promise<Book> => {
  const { title, author, published_year } = newBook;
  const result = await pool.query<Book>(
    `
      INSERT INTO books (title, author, published_year)
      VALUES ($1, $2, $3)
      RETURNING id, title, author, published_year, created_at
    `,
    [title, author, published_year],
  );

  return result.rows[0]!;
};

export const findExistingBook = async (
  book: NewBook,
): Promise<Book | null> => {
  const result = await pool.query<Book>(
    `
      SELECT id, title, author, published_year, created_at
      FROM books
      WHERE title = $1 AND author = $2 AND published_year = $3
      LIMIT 1
    `,
    [book.title, book.author, book.published_year],
  );

  return result.rows[0] ?? null;
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
  const result = await pool.query<Book>(GET_BOOKS_QUERY);
  return result.rows;
};

export const getBooksById = async (id : number) : Promise<Book> => {
    const result = await pool.query<Book>(
        'SELECT id, title, author, published_year, created_at FROM books WHERE id = $1',
        [id]
    );
    return result.rows[0]!;
    
}

export const updateBook = async(
    id : number, 
    updatedBook : Partial<NewBook>
) : Promise<Book> =>  { 
    
    
    const {title, author, published_year} = updatedBook;

    const result = await pool.query<Book>(
        `
            UPDATE books
            SET title = COALESCE($1, title),
                author = COALESCE($2, author),
                published_year = COALESCE($3, published_year)
            WHERE id = $4
            RETURNING id, title, author, published_year, created_at
        `,
        [title, author, published_year, id]
    );

    return result.rows[0]!;
}

export const deleteBook = async (id: number): Promise<Book | null> => {
  const result = await pool.query<Book>(
    `
      DELETE FROM books
      WHERE id = $1
      RETURNING id, title, author, published_year, created_at
    `,
    [id],
  );

  return result.rows[0] ?? null;
};
