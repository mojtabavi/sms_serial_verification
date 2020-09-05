const config = require("./config");
const sqlite3 = require("sqlite3").verbose();

function checkSerial(serial){
    // 0 => not find
    // 1 => find and valid
    // 2 find and invalid
    let valid = null
    let db = new sqlite3.Database("../data.sqlite", sqlite3.OPEN_READWRITE, (err) => {
        if (err) {
            console.error(err.message);
        } else {
            console.log("Connected to the SQLite database.");
        }
    });

    let sql = `SELECT * FROM invalids WHERE invalid_serial = "${serial}"`
    db.all(sql, [], (err, rows) => {
        if (err) {
            return console.error(err.message);
        }
        if (rows.length === 1) {
            valid = false
            console.log("the serial is among failed ones");
        }
        else if(rows.length === 0){
            valid = true
        }
    });


    let query = `SELECT * FROM serials WHERE start_serial < "${serial}" AND end_serial > "${serial}";`
// first row only
    db.all(query, [], (err, rows) => {
        if (err) {
            return console.error(err.message);
        }
        if (rows.length === 1 && valid !== false) {
            valid = true
           console.log("I found your serial");
        }
        else if(rows.length === 0){
            console.log("Your serial was not in db")
        }
    });
    

db.close()


}

checkSerial("JJ101");