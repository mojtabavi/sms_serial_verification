const express = require('express');
const main = require('./routes/apiv1');
const upload = require('./routes/uploadFile')
const app = express();
const path = require("path")


app.use(express.json());
app.set("views",path.join(__dirname,"views"))
app.set("view engine","ejs")
app.set("view engine","ejs")
app.use("/v1/process",main);
app.use("/file",upload);



const port = 5000
app.listen(port,() => console.log(`Listening to port ${port} ...`));

