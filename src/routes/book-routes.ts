import { Router } from "express";
import {
  createBook,
  createBooksBulk,
  getAllBooks,
  getBook,
  updateBook,
  deleteBook
} from "../controllers/book-controller";

const router = Router();

router.get("/", getAllBooks);
router.post("/", createBook);
router.post("/bulk", createBooksBulk);
router.get("/:id", getBook);
router.put("/:id", updateBook);
router.delete("/:id", deleteBook);

export default router;
