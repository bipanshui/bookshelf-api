import { Request, Response } from "express";
import { NewBook } from "../models/book-model";
import * as bookService from "../services/book-service";


export const getAllBooks = async (
  _req: Request,
  res: Response,
): Promise<void> => {
  try {
    const books = await bookService.getBooks();
    res.status(200).json(books);
  } catch (error) {
    console.error("Failed to fetch books", error);
    res.status(500).json({ message: "Failed to fetch books" });
  }
};

export const createBook = async (
  req: Request<unknown, unknown, Partial<NewBook>>,
  res: Response,
): Promise<void> => {
  const { title, author, published_year } = req.body;

  if (
    typeof title !== "string" ||
    typeof author !== "string" ||
    typeof published_year !== "number"
  ) {
    res.status(400).json({
      message: "title, author and published_year are required",
    });
    return;
  }

  try {
    const book = await bookService.createBook({
      title,
      author,
      published_year,
    });
    res.status(201).json(book);
  } catch (error) {
    console.error("Failed to create book", error);
    res.status(500).json({ message: "Failed to create book" });
  }
};


export const getBook = async(req : Request, res : Response) =>{
    try{
        const id = Number(req.params.id);
        if(isNaN(id)){
            return res.status(400)
                                .json({message : "this is an invalid id"})
        }

        const book = await bookService.getBooksById(id);
        if(!book){
            return res.
                        status(404).json({message : "book not found"})
        }
        res.status(200).json(book);

    }catch(error){
        console.error("Failed to fetch book", error);
        res.status(500).json({message : "Failed to fetch book"});
    }
}

export const updateBook = async(
    req : Request,
    res : Response
)  => { 
    try{
        const updated = await bookService.updateBook(
            Number(req.params.id),
            req.body
        );

        if(!updated){
            return res.status(404).json({message : "book not found"});
        }

        res.status(200).json(updated);
    }catch(error){
        console.error("Failed to update book", error);
        res.status(500).json({message : "Failed to update book"});
    }
}
