require("dotenv").config();
const express = require("express");
const app = express();
const pgp = require("pg-promise")();
const bodyParser = require("body-parser");
const cors = require("cors");
const PORT = process.env.PORT || 8080; //port number that we want to receive data on.

app.use(cors()); // using cors to allow for cross-origin requests from client to server
app.use(bodyParser.json()); // allows use to parse the body that is pass from the client.

//the database configuration, where we are getting the specific
const dbConfig = {
    host: "db",
    port: 5432,
    database: process.env.POSTGRES_DB,
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
};
const db = pgp(dbConfig);

/*** Defining endpoints below, where the end points are used in the config.js file in the client side***/


app.post("/login-user", (req, res) =>{
    console.log(req.body);
    res.json(true);
});


app.get("/", (req, res) => {
    res.send("hello from server");
});

app.listen(PORT, () => {
    console.log(`Server initiated on ${PORT}`);
});