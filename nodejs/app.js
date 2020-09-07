const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
var passport = require('passport');
var crypto = require('crypto');
// Package documentation - https://www.npmjs.com/package/connect-mongo
const MongoStore = require('connect-mongo')(session);
const connection = require('./config/database');
const main = require('./routes/apiv1');
const upload = require('./routes/uploadFile');
const home = require('./routes/home');
const path = require("path");
const rateLimit = require("express-rate-limit");

// Enable if you're behind a reverse proxy (Heroku, Bluemix, AWS ELB, Nginx, etc)
// see https://expressjs.com/en/guide/behind-proxies.html
// app.set('trust proxy', 1);

/**
 * -------------- GENERAL SETUP ----------------
 */

// Gives us access to variables set
require('dotenv').config();
// Create the Express application
const app = express();

app.use(express.json());
app.use(express.urlencoded({extended: true}));

/**
 * -------------- SESSION SETUP ----------------
 */

const sessionStore = new MongoStore({ mongooseConnection: connection, collection: 'sessions' });

app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    store: sessionStore,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 // Equals 1 day (1 day * 24 hr/1 day * 60 min/1 hr * 60 sec/1 min * 1000 ms / 1 sec)
    }
}));
/**
 * -------------- PASSPORT AUTHENTICATION ----------------
 */

// Need to require the entire Passport config module so app.js knows about it
require('./config/passport');

app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
    console.log(req.session);
    console.log(req.user);
    next();
});

const apiLimiter = rateLimit({
    max: 5
});

// only apply to requests that begin with /api/



app.use(express.json());
app.set("views",path.join(__dirname,"views"))
app.set("view engine","ejs")
app.use("/v1/process",main);
app.use("/file",upload);
app.use("/file",apiLimiter);
app.use("/",home);



const port = 5000
app.listen(port,() => console.log(`Listening to port ${port} ...`));

