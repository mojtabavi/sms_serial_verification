const xlsxFile = require("read-excel-file/node");
const mysqldb = require('mysql');
const normalize = require('./normalize');


function getJsDateFromExcel(excelDate) { return new Date((excelDate - (25567 + 2))*86400*1000); }

function convert_excel_to_db(validPath,invalidPath) {

    const db = mysqldb.createConnection({
        host     : process.env.MYSQL_HOST,
        user     : process.env.MYSQL_USERNAME,
        password : process.env.MYSQL_PASSWORD,
        database : process.env.MYSQL_DB_NAME,
    });
    db.connect();
    db.query("DROP TABLE IF EXISTS serials");
    db.query("CREATE TABLE serials (id INTEGER PRIMARY KEY,ref VARCHAR(200),description VARCHAR(300),start_serial CHAR(30),end_serial CHAR(30),date DATE);",function (error, results, fields) {
        if (error) throw error;
        console.log(results);
    });

    xlsxFile(validPath).then((rows) => {
        const header = rows.splice(0, 1);
        rows.forEach(row => {
            // let placeholders = `(${row.map((value) => value).join(',')})`
            // let sql = "INSERT INTO serials VALUES " + placeholders;
            // normalize the start and end serials
            row[3] = normalize(row[3])
            row[4] = normalize(row[4])
            row[5] = getJsDateFromExcel(row[5])
            //
            db.query(`INSERT INTO serials VALUES(?,?,?,?,?,?)`, row, function (error, results, fields) {
                if (error) throw error;
                console.log(`A row has been inserted into serials with rowid ${this.lastID}`);
                // connected!
            });
            // console.log(sql)
            // db.run(sql)
        });

        db.query("DROP TABLE IF EXISTS invalids");
        db.query("CREATE TABLE  invalids (invalid_serial CHAR(30) PRIMARY KEY)");

        xlsxFile(invalidPath).then((rows) => {
            const header = rows.splice(0, 1);
            rows.forEach(row => {
                // let placeholders = `(${row.map((value) => value).join(',')})`
                // let sql = "INSERT INTO serials VALUES " + placeholders;
                // normalize the start and end serials
                row[0] = normalize(row[0]);
                //
                db.query(`INSERT INTO invalids VALUES(?)`, row, function (error, results, fields) {
                    if (error) throw error;
                    // connected!
                    console.log(`A row has been inserted into invalids with rowid ${results.insertId}`);
                });
                // console.log(sql)
                // db.run(sql)
            });

            db.end();
        });
    });
}

module.exports = convert_excel_to_db;