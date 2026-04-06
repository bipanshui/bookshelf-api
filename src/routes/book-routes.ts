import { Router } from "express";
import {
  createBook,
  createBooksBulk,
  getAllBooks,
  getBook,
  searchBooks,
  updateBook,
  deleteBook
} from "../controllers/book-controller";
import { validate } from "../middleware/validate";
import {
  bookQuerySchema,
  bulkBooksSchema,
  idParamSchema,
  newBookSchema,
  updateBookSchema,
} from "../schemas/book-schema";

const router = Router();

router.get("/", getAllBooks);
router.get("/search", validate({ query: bookQuerySchema }), searchBooks);
router.post("/", validate({ body: newBookSchema }), createBook);
router.post("/bulk", validate({ body: bulkBooksSchema }), createBooksBulk);
router.get("/:id", validate({ params: idParamSchema }), getBook);
router.put(
  "/:id",
  validate({ params: idParamSchema, body: updateBookSchema }),
  updateBook,
);
router.delete("/:id", validate({ params: idParamSchema }), deleteBook);

export default router;
