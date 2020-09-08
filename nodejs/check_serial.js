const config = require("./config");
const mysqldb = require('mysql');
require('dotenv').config();

function checkSerial(serial) {
    return new Promise(function (resolve, reject)
    {
        const db = mysqldb.createConnection({
            host: process.env.MYSQL_HOST,
            user: process.env.MYSQL_USERNAME,
            password: process.env.MYSQL_PASSWORD,
            database: process.env.MYSQL_DB_NAME,
        });
        db.connect();

        db.query(`SELECT * FROM serials WHERE start_serial < "${serial}" AND end_serial > "${serial}";`, function (error, results, fields) {
            if (error) reject(error);
            if (results.length !== 0) {
                resolve("I found your serial");
            }
        });

        db.query(`SELECT * FROM invalids WHERE invalid_serial = "${serial}"`, function (error, results, fields) {
            if (error) reject(error);
            if (results.length !== 0) {
                resolve("the serial is among failed ones");
            }
            else {
                resolve("Your Serial is not in db");
            }
        });
        db.end();
    });
}

module.exports = checkSerial
