const express = require("express");
require("dotenv").config();

const app = express();

app.listen(process.env.PORT, () =>
    console.log("http://localhost:" + process.env.PORT)
);
