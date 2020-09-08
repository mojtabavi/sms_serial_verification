const normalize = require('../normalize')
const {sendMessage} = require("../sms");
const checkSerial = require("../check_serial")
const express = require('express');
const router = express.Router();
const smsLog = require('../lib/incomingSmsLog');


router.get("/",(req,res) =>{
    const message = normalize(req.query.text);
    const sender = req.query.from;
    console.log(`receive ${message} from ${sender}`);
    checkSerial(message).then(answer => {
        sendMessage(sender,answer)
        smsLog(sender,message,answer,new Date())
            .then(result => console.log(result))
            .catch(err => console.log(err));
    }).catch(err => {
        sendMessage(sender,"در حال حاضر قادر به پاسخگویی نیستیم لطفا مجددا تلاش فرمایید")
        smsLog(sender,message,err,new Date())
            .then(result => console.log(result))
            .catch(err => console.log(err));
    })

    res.status(200).send({message:'processed'});
});

module.exports = router