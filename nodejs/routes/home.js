const router = require('express').Router();
const passport = require('passport');
const genPassword = require('../lib/passwordUtils').genPassword;
const connection = require('../config/database');
const User = connection.models.User;
const isAuth = require('./authMiddleware').isAuth;
const isAdmin = require('./authMiddleware').isAdmin;
const upload = require('../lib/uploadFile');
const excelToDb = require('../excelToDb');
const checkSerial = require("../check_serial");
const dataSms = require("../lib/dataSms");



router.post('/login', passport.authenticate('local', { failureRedirect: '/login-failure', successRedirect: 'login-success' }));

router.post('/', isAuth, (req, res, next) => {
    upload(req,res,function(err) {

        if(err) {

            // ERROR occured (here it can be occured due
            // to uploading image of size greater than
            // 1MB or uploading different file type)
            dataSms()
                .then(data => res.status(401).render('index',{data:data, message:err,alert:"warning"}))
                .catch(err => {console.log(err)
                    res.render('index',{data:undefined, message:undefined, alert:"warning"});
                })
        }
        else {

            // SUCCESS, image successfully uploaded

            excelToDb("./uploads/data.xlsx","./uploads/invalid.xlsx");
            dataSms()
                .then(data => res.status(200).render('index',{data:data, message:"two Files Uploaded successfully", alert:"success"}))
                .catch(err => {console.log(err)
                    res.render('index',{data:undefined, message:undefined, alert:"warning"});
                })
        }
    })
});

router.post('/getCheckSerial', isAuth, (req, res, next) => {
        checkSerial(req.body.serial)
            .then(result =>  {res.status(200).render('index',{message: result ,alert:"info"})
                                console.log(result)})
            .catch(err => res.status(401).render('index',{message: err ,alert:"warning"}))
});
/*
    User Register disable permanently
 */

/*router.post('/register', (req, res, next) => {
    const saltHash = genPassword(req.body.pw);

    const salt = saltHash.salt;
    const hash = saltHash.hash;

    const newUser = new User({
        username: req.body.uname,
        hash: hash,
        salt: salt,
        admin: true
    });

    newUser.save()
        .then((user) => {
            console.log(user);
        });

    res.redirect('/login');
});*/

router.get('/', isAuth, (req, res, next) => {
    dataSms()
        .then(data => res.render('index',{data:data, message:undefined, alert:"warning"}))
        .catch(err => {console.log(err)
            res.render('index',{data:undefined, message:undefined, alert:"warning"});
        })
});

// When you visit http://localhost:5000/login, you will see "Login Page"
router.get('/login', (req, res, next) => {

    res.render("login")

});

// When you visit http://localhost:3000/register, you will see "Register Page"
/*
router.get('/register', (req, res, next) => {

    const form = '<h1>Register Page</h1><form method="post" action="register">\
                    Enter Username:<br><input type="text" name="uname">\
                    <br>Enter Password:<br><input type="password" name="pw">\
                    <br><br><input type="submit" value="Submit"></form>';

    res.send(form);

});
*/

/**
 * Lookup how to authenticate users on routes with Local Strategy
 * Google Search: "How to use Express Passport Local Strategy"
 *
 * Also, look up what behaviour express session has without a maxage set
 */

// Visiting this route logs the user out
router.get('/logout', (req, res, next) => {
    req.logout();
    res.status(200).render("login")
});

router.get('/login-success', (req, res, next) => {
    res.redirect('/');
});

router.get('/login-failure', (req, res, next) => {
    res.send('You entered the wrong password.');
});

module.exports = router;