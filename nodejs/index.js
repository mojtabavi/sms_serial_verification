const express = require('express');
const excelToDb = require('./excelToDb')
const main = require('./routes/apiv1')
const app = express();


app.use(express.json())
app.use("/v1/process",main)

excelToDb();



app.listen(5000,() => console.log('Listening to port 5000 ... '));

