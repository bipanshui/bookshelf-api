import { Router } from "express";
import { createBook, getAllBooks, getBook, updateBook } from "../controllers/book-controller";
import { get } from "node:http";
 

const router = Router();

router.get("/", getAllBooks);
router.post("/", createBook);
router.get("/:id", getBook);
router.put("/:id", updateBook);

export default router;

