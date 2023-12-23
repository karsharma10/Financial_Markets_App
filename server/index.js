require("dotenv").config();
const express = require("express");
const app = express();
const pgp = require("pg-promise")();
const bodyParser = require("body-parser");
const bcrypt = require('bcrypt'); //want to include a hashing algorithm
const cors = require("cors");
const {query} = require("express");
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

app.post("/login-user",  (req, res) => {
    console.log(req.body.password);
    //run a query to the database to see if that email and password match:

    db.any((`SELECT password FROM users where users.email = '${req.body.email}'` + ";"))
        .then(async (data) => {
            const match = await bcrypt.compare(req.body.password, data[0].password); //compare the hashes of input and password in the database
            if (match === true) {
                res.json(true);
            } else {
                res.json(false);
            }
        })
        .catch((err) => { //if there's an error, it means the user doesn't exist in the database.
            res.json("Your Account Doesn't Exist");
        });
});
app.post("/add-user", async (req, res) => {

    res.json(true)
    const {email, firstName, lastName, password} = req.body || {}
    const hash = await bcrypt.hash(password, 10); //hash the password that is used

    if (!email || !firstName || !lastName || !password) {
        res.status(400).json({message: "Please provide all the fields"})
    } else {
        db.query("INSERT INTO users (firstName, lastName, email, password) VALUES ($1, $2, $3, $4)", [firstName, lastName, email, hash])
            .then(r => {
                console.log(r)
            })
            .catch((err) => {
                res.json(err);
            });
    }

})
app.get("/", (req, res) => {
    res.send("hello from server");
});


app.listen(PORT, () => {
    console.log(`Server initiated on ${PORT}`);
});