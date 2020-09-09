const mysqldb = require('mysql');
require('dotenv').config();


function dataSms(){
    return new Promise((resolve,reject) => {
        const db = mysqldb.createConnection({
            host     : process.env.MYSQL_HOST,
            user     : process.env.MYSQL_USERNAME,
            password : process.env.MYSQL_PASSWORD,
            database : process.env.MYSQL_DB_NAME,
        });
        db.connect();
        db.query("SELECT * FROM PROCESSED_SMS ORDER BY date DESC LIMIT 5000", function (error, results, fields) {
            if (error) reject(error);
            resolve(results)
        });
        db.end();
    });

}

module.exports = dataSms