type RouteDoc = {
  method: "GET" | "POST" | "PUT" | "DELETE";
  path: string;
  description: string;
  params?: Record<string, string>;
  bodyType?: string;
  responseType?: string;
};

export const apiDocs: RouteDoc[] = [
  {
    method: "GET",
    path: "/",
    description: "Health check route",
    responseType: "text/plain",
  },
  {
    method: "GET",
    path: "/books",
    description: "Fetch all books",
    responseType: "Book[]",
  },
  {
    method: "POST",
    path: "/books",
    description: "Create a single book",
    bodyType: "NewBook",
    responseType: "Book",
  },
  {
    method: "POST",
    path: "/books/bulk",
    description: "Create multiple books",
    bodyType: "NewBook[]",
    responseType: "BulkCreateBooksResponse",
  },
  {
    method: "GET",
    path: "/books/:id",
    description: "Fetch a book by id",
    params: {
      id: "positive integer",
    },
    responseType: "Book",
  },
  {
    method: "PUT",
    path: "/books/:id",
    description: "Update one or more book fields",
    params: {
      id: "positive integer",
    },
    bodyType: "Partial<NewBook>",
    responseType: "Book",
  },
  {
    method: "DELETE",
    path: "/books/:id",
    description: "Delete a book by id",
    params: {
      id: "positive integer",
    },
    responseType: "Book",
  },
];
