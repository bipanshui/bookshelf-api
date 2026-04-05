import express from "express"
import dotenv from "dotenv"

dotenv.config()

const app = express()
app.use(express.json())

app.get("/", (req, res)=>{
    res.send("BookShelf API running ... ");
})

app.listen(3000, ()=>{
    console.log(`listening at the port 3000`)
})