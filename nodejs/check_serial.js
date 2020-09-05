const config = require("./config");
const sqlite3 = require("sqlite3").verbose();

function checkSerial(serial){
    let db = new sqlite3.Database("../data.sqlite", sqlite3.OPEN_READWRITE, (err) => {
        if (err) {
            console.error(err.message);
        } else {
            console.log("Connected to the SQLite database.");
        }
    });

    let query = `SELECT * FROM serials WHERE start_serial < "${serial}" AND end_serial > "${serial}";`
// first row only
    db.all(query, [], (err, rows) => {
        if (err) {
            return console.error(err.message);
        }
        if (rows.length === 1) {
            db.close();
           return "I found your serial";
        }
    });

    let sql = `SELECT * FROM invalids WHERE invalid_serial = "${serial}"`
    db.all(sql, [], (err, rows) => {
        if (err) {
            return console.error(err.message);
        }
        if (rows.length === 1) {
            db.close();
            return "the serial is among failed ones";
        }
    });
    db.close();
    return "it was not in the db";


}

checkSerial("JJ1000003")