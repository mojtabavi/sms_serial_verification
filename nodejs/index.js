const express = require('express');
const app = express();

app.use(express.json())

app.get('/v1/process',(req,res) => {
    const message = req.query.text;
    const sender = req.query.from;
    console.log(`receive ${message} from ${sender}`);
    res.status(200).send({message:'processed'});
})

app.listen(5000,() => console.log('Listening to port 5000 ... '))