const mysqldb = require('mysql');
require('dotenv').config();


function smsLog(sender,message,answer,date){
return new Promise((resolve,reject) => {
    const db = mysqldb.createConnection({
        host     : process.env.MYSQL_HOST,
        user     : process.env.MYSQL_USERNAME,
        password : process.env.MYSQL_PASSWORD,
        database : process.env.MYSQL_DB_NAME,
    });
    db.connect();
    db.query("INSERT INTO PROCESSED_SMS VALUES (?,?,?,?)",[sender,message,answer,date],function (error, results, fields) {
        if (error) reject(error);
        resolve(results)
    });
    db.end();
});

}

module.exports = smsLog