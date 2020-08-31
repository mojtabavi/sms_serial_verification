const express = require('express');
const sendsms = require("./sms")
const readXlsxFile = require('read-excel-file/node');
const app = express();


app.use(express.json())

app.get('/v1/process',(req,res) => {
    const message = req.query.text;
    const sender = req.query.from;
    console.log(`receive ${message} from ${sender}`);
    res.status(200).send({message:'processed'});
})

async function excelParser(){
    

    // File path.
    const rows = await readXlsxFile('../data.xlsx');
    print(rows)
}

// sendsms("09392115688", "تست ارسال به تلفن همراه");
excelParser()
app.listen(5000,() => console.log('Listening to port 5000 ... '));

