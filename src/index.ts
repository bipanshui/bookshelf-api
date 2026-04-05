import express from "express";
import dotenv from "dotenv";
import bookRoutes from "./routes/book-routes";

dotenv.config();

const app = express();
const port = Number(process.env.PORT) || 3000;

app.use(express.json());
app.use("/books", bookRoutes);

app.get("/", (_req, res) => {
  res.send("BookShelf API running ... ");
});

app.listen(port, () => {
  console.log(`listening at the port ${port}`);
});
