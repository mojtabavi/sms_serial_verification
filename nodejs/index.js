const express = require('express');
const sendsms = require("./sms")
const xlsxFile = require("read-excel-file/node");
const sqlite3 = require("sqlite3").verbose();
const app = express();


app.use(express.json())

app.get('/v1/process',(req,res) => {
    const message = req.query.text;
    const sender = req.query.from;
    console.log(`receive ${message} from ${sender}`);
    res.status(200).send({message:'processed'});
})

let db = new sqlite3.Database("../data.sqlite", sqlite3.OPEN_READWRITE, (err) => {
  if (err) {
    console.error(err.message);
  } else {
    console.log("Connected to the SQLite database.");
  }
});

db.run("DROP TABLE IF EXISTS serials");
db.run("CREATE TABLE IF NOT EXISTS serials (id INTEGER PRIMARY KEY,ref TEXT,desc TEXT,start_serial TEXT,end_serial TEXT,date DATE);");

xlsxFile("../data.xlsx").then((rows) => {
    const header = rows.splice(0,1);
    rows.forEach(row => {
        // let placeholders = `(${row.map((value) => value).join(',')})`
        // let sql = "INSERT INTO serials VALUES " + placeholders;
        db.run(`INSERT INTO serials VALUES(?,?,?,?,?,?)`, row, function (err) {
          if (err) {
            return console.log(err.message);
          }
          // get the last insert id
          console.log(`A row has been inserted with rowid ${this.lastID}`);
        });
        // console.log(sql)
        // db.run(sql)
    });
    db.close();
});  




// sendsms("09392115688", "تست ارسال به تلفن همراه");
app.listen(5000,() => console.log('Listening to port 5000 ... '));

