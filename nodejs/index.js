const express = require('express');
const {sendMessage} = require("./sms")
const excelToDb = require('./excelToDb')
const normalize = require('./normalize')
const app = express();


app.use(express.json())


app.get('/v1/process',(req,res) => {
    const message = normalize(req.query.text);
    const sender = req.query.from;
    console.log(`receive ${message} from ${sender}`);
    sendMessage(sender, `ما پیام شما را دریافت کردیم`);
    res.status(200).send({message:'processed'});
})

excelToDb();



app.listen(5000,() => console.log('Listening to port 5000 ... '));

