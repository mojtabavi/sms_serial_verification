const config = require("./config");
const sqlite3 = require("sqlite3").verbose();
const sqlite = require("sqlite-sync");

function checkSerial(serial){

    sqlite.connect('../data.sqlite');

    let query = sqlite.run(`SELECT * FROM invalids WHERE invalid_serial = "${serial}"`);
    if (query.length === 1) {
        sqlite.close();
        return "the serial is among failed ones";
    }
    query = sqlite.run(`SELECT * FROM serials WHERE start_serial < "${serial}" AND end_serial > "${serial}";`);
    if (query.length === 1) {
        sqlite.close();
        return  "I found your serial";
    }
    sqlite.close();
    return "Your Serial is not in db"


}

module.exports = checkSerial