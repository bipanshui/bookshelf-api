export interface Book {
  id: number;
  title: string;
  author: string;
  published_year: number;
  created_at: Date;
}

export type NewBook = Omit<Book, "id" | "created_at">;

export interface BookQueryOptions {
  page: number;
  limit: number;
  author?: string;
  published_year?: number;
  search?: string;
  sort_by: "id" | "title" | "author" | "published_year" | "created_at";
  order: "asc" | "desc";
}

export interface PaginatedBooksResult {
  data: Book[];
  pagination: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
  filters: {
    author?: string;
    published_year?: number;
    search?: string;
    sort_by: BookQueryOptions["sort_by"];
    order: BookQueryOptions["order"];
  };
}
