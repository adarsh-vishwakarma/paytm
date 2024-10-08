const express = require("express");
const app = express();
const rootRouter = require("./routes/index") 
require('dotenv').config();

const PORT = process.env.PORT;
app.use(cors())
app.use(express.json())

app.use("/api/v1", rootRouter)

app.listen(PORT, ()=>{
    console.log(`app is listening on port ${PORT}`)
})
