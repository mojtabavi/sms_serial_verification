const normalize = require('./normalize')
const {sendMessage} = require("./sms")
const express = require('express');
const router = express.Router();


router.get("/",(req,res) =>{
    const message = normalize(req.query.text);
    const sender = req.query.from;
    console.log(`receive ${message} from ${sender}`);
    sendMessage(sender, `ما پیام شما را دریافت کردیم`);
    res.status(200).send({message:'processed'});
});

module.exports = router