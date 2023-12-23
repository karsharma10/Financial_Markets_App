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

// TO-DO:
//Add hashing to this function below
//Add error message to the screen
app.post("/login-user", (req, res) => {
    console.log(req.body.password);
    //run a query to the database to see if that email and password match:

    db.any((`SELECT password FROM users where users.email = '${req.body.email}'` +";"))
        .then((data)=>{
            if(data[0].password === req.body.password){
                res.json(true);
            }
            else{
                res.json(false);
            }
        })
        .catch((err) => { //if there's an error, it means the user doesn't exist in the database.
            res.json("Your Account Doesn't Exist");
        });
});

app.get("/", (req, res) => {
    res.send("hello from server");
});

app.post("/add-user", (req,res)=>{
    console.log(req.body);
    res.json(true)
})



// app.post("/add-user", (req, res) => {
//     const {username, profile_image, description} = req.body || {};
//
//     if (!username || !profile_image || !description) {
//         res.status(400).json({message: "Please provide all fields"});
//     } else {
//         db.query(
//             "INSERT INTO users (username, profile_image, description) VALUES ($1, $2, $3) returning username, description, profile_image;",
//             [username, profile_image, description]
//         )
//             .then((data) => {
//                 console.log(data[0]);
//                 res.json(data[0]);
//             })
//             .catch((err) => {
//                 res.json(err);
//             });
//     }
// });
app.listen(PORT, () => {
    console.log(`Server initiated on ${PORT}`);
});