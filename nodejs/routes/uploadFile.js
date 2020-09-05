const multer = require('multer');
const express = require('express');
const router = express.Router();
const path = require("path");
const excelToDb = require('../excelToDb');

// var upload = multer({ dest: "Upload_folder_name" })
// If you do not want to use diskStorage then uncomment it

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Uploads is the Upload_folder_name
        cb(null, "uploads")
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
})

// Define the maximum size for uploading
// picture i.e. 1 MB. it is optional
const maxSize = 1 * 1000 * 1000;

const upload = multer({
    storage: storage,
    limits: { fileSize: maxSize },
    /*fileFilter: function (req, file, cb){

        // Set the filetypes, it is optional
        const filetypes = /xlsx/;
        const mimetype = filetypes.test(file.mimetype);

        const extname = filetypes.test(path.extname(
            file.originalname).toLowerCase());

        if (mimetype && extname) {
            return cb(null, true);
        }

        cb("Error: File upload only supports the "
            + "following filetypes - " + filetypes);
    }*/

// mypic is the name of file attribute
}).array("multiple_file");

router.get("/",function(req,res){
    res.render("upload");
})

router.post("/uploadFile",function (req, res, next) {

    // Error MiddleWare for multer file upload, so if any
    // error occurs, the image would not be uploaded!
    upload(req,res,function(err) {

        if(err) {

            // ERROR occured (here it can be occured due
            // to uploading image of size greater than
            // 1MB or uploading different file type)
            res.send(err)
        }
        else {

            // SUCCESS, image successfully uploaded
            res.send("Success, Files Uploaded")
            excelToDb("./uploads/data.xlsx","./uploads/invalid.xlsx");
        }
    })
})



module.exports = router