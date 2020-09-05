const normalize = require('../normalize')
const {sendMessage} = require("../sms");
const checkSerial = require("../check_serial")
const express = require('express');
const router = express.Router();


router.get("/",(req,res) =>{
    const message = normalize(req.query.text);
    const sender = req.query.from;
    console.log(`receive ${message} from ${sender}`);
    sendMessage(sender, checkSerial(message));
    res.status(200).send({message:'processed'});
});

module.exports = router