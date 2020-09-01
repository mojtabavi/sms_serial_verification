const express = require('express');
const {sendMessage} = require("./sms")
const excelToDb = require('./excelToDb')
const app = express();


app.use(express.json())


app.get('/v1/process',(req,res) => {
    const message = req.query.text;
    const sender = req.query.from;
    console.log(`receive ${message} from ${sender}`);
    sendMessage(sender, `ما پیام شما را دریافت کردیم`);
    res.status(200).send({message:'processed'});
})

excelToDb();



// sendsms("09392115688", "تست ارسال به تلفن همراه");
app.listen(5000,() => console.log('Listening to port 5000 ... '));

