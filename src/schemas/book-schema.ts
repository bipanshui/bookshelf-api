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

export const updateBookSchema = newBookSchema.partial().refine(
  (value) => Object.keys(value).length > 0,
  {
    message: "At least one field is required to update a book",
  },
);

export type NewBookInput = z.infer<typeof newBookSchema>;
export type UpdateBookInput = z.infer<typeof updateBookSchema>;
