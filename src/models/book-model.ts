export interface Book {
  id: number;
  title: string;
  author: string;
  published_year: number;
  created_at: Date;
}

export type NewBook = Omit<Book, "id" | "created_at">;
