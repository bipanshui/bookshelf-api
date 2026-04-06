import { z } from "zod";

export const idParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const newBookSchema = z.object({
  title: z.string().trim().min(1, "title is required"),
  author: z.string().trim().min(1, "author is required"),
  published_year: z
    .number()
    .int("published_year must be an integer")
    .min(0, "published_year must be a valid year"),
});

export const bulkBooksSchema = z
  .array(newBookSchema)
  .min(1, "Request body must be a non-empty array of books");

export const bookQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  author: z.string().trim().min(1).optional(),
  published_year: z.coerce.number().int().min(0).optional(),
  search: z.string().trim().min(1).optional(),
  sort_by: z
    .enum(["id", "title", "author", "published_year", "created_at"])
    .default("id"),
  order: z.enum(["asc", "desc"]).default("asc"),
});

export const updateBookSchema = newBookSchema.partial().refine(
  (value) => Object.keys(value).length > 0,
  {
    message: "At least one field is required to update a book",
  },
);

export type NewBookInput = z.infer<typeof newBookSchema>;
export type BookQueryInput = z.infer<typeof bookQuerySchema>;
export type UpdateBookInput = z.infer<typeof updateBookSchema>;
