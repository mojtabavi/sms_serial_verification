const xlsxFile = require("read-excel-file/node");
const sqlite3 = require("sqlite3").verbose();
const normalize = require('./normalize')

function convert_excel_to_db(validPath,invalidPath) {
    let db = new sqlite3.Database("./data.sqlite", sqlite3.OPEN_READWRITE, (err) => {
        if (err) {
            console.error(err.message);
        } else {
            console.log("Connected to the SQLite database.");
        }
    });

    db.run("DROP TABLE IF EXISTS serials");
    db.run("CREATE TABLE IF NOT EXISTS serials (id INTEGER PRIMARY KEY,ref TEXT,desc TEXT,start_serial TEXT,end_serial TEXT,date DATE);");

    xlsxFile(validPath).then((rows) => {
        const header = rows.splice(0, 1);
        rows.forEach(row => {
            // let placeholders = `(${row.map((value) => value).join(',')})`
            // let sql = "INSERT INTO serials VALUES " + placeholders;
            // normalize the start and end serials
            row[3] = normalize(row[3])
            row[4] = normalize(row[4])
            //
            db.run(`INSERT INTO serials VALUES(?,?,?,?,?,?)`, row, function (err) {
                if (err) {
                    return console.log(err.message);
                }
                // get the last insert id
                console.log(`A row has been inserted into serials with rowid ${this.lastID}`);
            });
            // console.log(sql)
            // db.run(sql)
        });

        db.run("DROP TABLE IF EXISTS invalids");
        db.run("CREATE TABLE IF NOT EXISTS invalids (invalid_serial TEXT PRIMARY KEY)");

        xlsxFile(invalidPath).then((rows) => {
            const header = rows.splice(0, 1);
            rows.forEach(row => {
                // let placeholders = `(${row.map((value) => value).join(',')})`
                // let sql = "INSERT INTO serials VALUES " + placeholders;
                // normalize the start and end serials
                row[0] = normalize(row[0]);
                //
                db.run(`INSERT INTO invalids VALUES(?)`, row, function (err) {
                    if (err) {
                        return console.log(err.message);
                    }
                    // get the last insert id
                    console.log(`A row has been inserted into invalids with rowid ${this.lastID}`);
                });
                // console.log(sql)
                // db.run(sql)
            });

            db.close();
        });
    });
}

module.exports = convert_excel_to_db;