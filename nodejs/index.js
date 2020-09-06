const express = require('express');
const main = require('./routes/apiv1');
const upload = require('./routes/uploadFile')
const app = express();
const path = require("path")
const rateLimit = require("express-rate-limit");

// Enable if you're behind a reverse proxy (Heroku, Bluemix, AWS ELB, Nginx, etc)
// see https://expressjs.com/en/guide/behind-proxies.html
// app.set('trust proxy', 1);

const apiLimiter = rateLimit({
    max: 5
});

// only apply to requests that begin with /api/



app.use(express.json());
app.set("views",path.join(__dirname,"views"))
app.set("view engine","ejs")
app.set("view engine","ejs")
app.use("/v1/process",main);
app.use("/file",upload);
app.use("/file",apiLimiter);



const port = 5000
app.listen(port,() => console.log(`Listening to port ${port} ...`));

