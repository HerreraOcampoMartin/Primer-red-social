const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const fileUpload = require('express-fileupload');
require("dotenv").config();

const app = express();
require("./database");

//CONFIG
app.set("views", path.join(__dirname, "views"));
app.set("PORT", process.env.PORT);
app.engine('html', require('ejs').renderFile);
app.use(
    express.urlencoded({
        extended: false,
    })
);
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(fileUpload());

//ROUTES
app.use(require("./routes/publicRoutes"));
app.use(require("./routes/notificationController"));
app.use(require("./routes/functionRoutes"));
app.use(require("./routes/profileRoutes"));
app.use(require("./routes/chatsRoutes"));

//LISTEN
app.listen(app.get("PORT"), () =>
    console.log("http://localhost:" + app.get("PORT"))
);