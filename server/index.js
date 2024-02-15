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

// database configuration
const user = {
  firstName: undefined,
  lastName: undefined,
  UserEmail: undefined,
  results: undefined,
  stock_ticker: undefined,
  bus_day: undefined,
  stock_information: undefined
};


const dbConfig = {
    host: 'db',
    port: 5432,
    database: process.env.POSTGRES_DB,
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
  };

  const db = pgp(dbConfig);

  app.use(
    session({
      secret: process.env.SESSION_SECRET,
      saveUninitialized: false,
      resave: false,
    })
  );

  // test your database
  db.connect()
    .then(obj => {
      console.log('Database connection successful'); // you can view this message in the docker compose logs
      obj.done(); // success, release the connection;
    })
    .catch(error => {
      console.log('ERROR:', error.message || error);
    });

  // Authentication Middleware.
  const auth = (req, res, next) => {
    if (!req.session.user) {
      // Default to register page.
      res.redirect('/main');
    }
    next();
  };
  
  // Authentication Required
  //app.use(auth);

app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

  
app.use(
    bodyParser.urlencoded({
      extended: true,
    })
  );
app.get('/', (req, res) =>{
    res.redirect('/main');
});

app.get('/account', auth,(req, res) =>{
  res.render('pages/account',{
      firstName: req.session.user.firstName,
      lastName: req.session.user.lastName,
      UserEmail: req.session.user.UserEmail,
      results: req.session.user.results,
      stock_ticker: req.session.user.stock_ticker,
      bus_day: req.session.user.bus_day,
      stock_information: req.session.user.stock_information,
  }); 
});


app.get('/login', (req, res) =>{
    res.render('pages/login'); //this will call the /anotherRoute route in the API
});

app.get('/main', (req, res) =>{
  if(req.session.user == undefined){
    res.render('pages/main'); 
  }
  else{
    res.render('pages/main',{
      firstName: req.session.user.firstName,
      lastName: req.session.user.lastName,
      UserEmail: req.session.user.UserEmail
    });
  }
  
});

app.get('/prices',(req, res) =>{
  if(req.session.user == undefined){
    res.render('pages/prices'); 
  }
  else{
    res.render('pages/prices',{
      firstName: req.session.user.firstName,
      lastName: req.session.user.lastName,
      UserEmail: req.session.user.UserEmail
    });
  }
  
});

app.get('/dashboard',auth,(req, res) =>{
  if(req.session.user == undefined){
    res.render('pages/dashboard'); 
  }
  else{

    //Get the date for the API:
    function formatDateInMST(date) {
      // Convert to MST (UTC-7)
      const mstOffset = 7 * 60; // 7 hours in minutes
      const mstDate = new Date(date.getTime() - (mstOffset * 60000));
  
      const year = mstDate.getFullYear();
      const month = (mstDate.getMonth() + 1).toString().padStart(2, '0'); // JavaScript months are 0-indexed
      const day = mstDate.getDate().toString().padStart(2, '0');
  
      return `${year}-${month}-${day}`;
    }
  
  // Get today's date in MST
      const todayInMST = formatDateInMST(new Date());
  
  // Get the date from 7 days ago in MST
      const sevenDaysAgoInMST = new Date();
      sevenDaysAgoInMST.setDate(sevenDaysAgoInMST.getDate() - 7);
      const formattedSevenDaysAgoInMST = formatDateInMST(sevenDaysAgoInMST);
  
  

      

    axios.all([
        axios.get(`https://api.polygon.io/v2/aggs/ticker/AAPL/range/1/day/${formattedSevenDaysAgoInMST}/${todayInMST}?adjusted=true&sort=asc&limit=120&apiKey=${process.env.POLYGONAPIKEY}`),
        axios.get(`https://api.polygon.io/v3/reference/tickers/AAPL?date=${todayInMST}&apiKey=${process.env.POLYGONAPIKEY}`)
    ])
      .then(axios.spread((results, stock_ticker_data) => {

        //console.log(stock_ticker_data.data.results);
        
        const start_dash_data = [];
        
        const obj = JSON.parse(JSON.stringify(results.data.results));
        

        for(let step = 0; step < obj.length; step++){
          start_dash_data[step] = obj[step]['c'];
        }


      

        function isBusinessDay(date) {
          const dayOfWeek = date.getDay();
          return dayOfWeek !== 0 && dayOfWeek !== 6; // 0 is Sunday, 6 is Saturday
      }
      
      function getLast5BusinessDays() {
          let businessDays = [];
          let date = new Date(); // Today's date
      
          // Start from the previous day
          date.setDate(date.getDate() - 1);
      
          while (businessDays.length < 5) {
              if (isBusinessDay(date)) {
                  // Format the date as "Dec 5"
                  let formattedDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                  businessDays.push(formattedDate);
              }
              // Go to the previous day
              date.setDate(date.getDate() - 1);
          }
      
          // Return the array without reversing
          return businessDays;
      }
      
      user.results = start_dash_data;
      user.stock_ticker = results.data.ticker;
      user.bus_day  = getLast5BusinessDays().reverse();
      user.stock_information = stock_ticker_data.data.results;
      req.session.user = user;
      req.session.save();


        res.render('pages/dashboard',{
          firstName: req.session.user.firstName,
          lastName: req.session.user.lastName,
          UserEmail: req.session.user.UserEmail,
          results: start_dash_data,
          stock_ticker: results.data.ticker,
          bus_day: getLast5BusinessDays().reverse(),
          stock_information: stock_ticker_data.data.results
        });
        
      }));

  }
  
});

app.get('/signup', (req, res) =>{
  res.render('pages/signup'); //this will call the /anotherRoute route in the API
});

app.get('/login_page', auth,(req, res) =>{

  res.render('pages/main',{
    firstName: req.session.user.firstName,
    lastName: req.session.user.lastName,
    UserEmail: req.session.user.UserEmail
  });

});

app.get('/logout', auth,(req, res) =>{
  req.session.destroy();
  res.redirect('/main');
});


app.post('/search_ticker', auth,(req, res) =>{
  //console.log(req.session.user.stock_information);


  if(req.body.ticker_search == ""){
    res.render('pages/dashboard', {
      showModal: true,
      firstName: req.session.user.firstName,
      lastName: req.session.user.lastName,
      UserEmail: req.session.user.UserEmail,
      results: req.session.user.results,
      stock_ticker: req.session.user.stock_ticker,
      bus_day: req.session.user.bus_day,
      stock_information: req.session.user.stock_information,

      error: true,
      message: "Please Enter A Ticker"
    });


  }
  else{ //call API call

    //Get the date for the API:
    function formatDateInMST(date) {
      // Convert to MST (UTC-7)
      const mstOffset = 7 * 60; // 7 hours in minutes
      const mstDate = new Date(date.getTime() - (mstOffset * 60000));
  
      const year = mstDate.getFullYear();
      const month = (mstDate.getMonth() + 1).toString().padStart(2, '0'); // JavaScript months are 0-indexed
      const day = mstDate.getDate().toString().padStart(2, '0');
  
      return `${year}-${month}-${day}`;
    }
  
  // Get today's date in MST
      const todayInMST = formatDateInMST(new Date());
  
  // Get the date from 7 days ago in MST
      const sevenDaysAgoInMST = new Date();
      sevenDaysAgoInMST.setDate(sevenDaysAgoInMST.getDate() - 7);
      const formattedSevenDaysAgoInMST = formatDateInMST(sevenDaysAgoInMST);
  
  

      

    axios.all([
        axios.get(`https://api.polygon.io/v2/aggs/ticker/${req.body.ticker_search}/range/1/day/${formattedSevenDaysAgoInMST}/${todayInMST}?adjusted=true&sort=asc&limit=120&apiKey=${process.env.POLYGONAPIKEY}`),
        axios.get(`https://api.polygon.io/v3/reference/tickers/${req.body.ticker_search}?date=${todayInMST}&apiKey=${process.env.POLYGONAPIKEY}`)
    ])

    .then(axios.spread((results, stock_ticker_data) => {

      //console.log(stock_ticker_data.data.results);
      
      const start_dash_data = [];
      
      const obj = JSON.parse(JSON.stringify(results.data.results));
      

      for(let step = 0; step < obj.length; step++){
        start_dash_data[step] = obj[step]['c'];
      }


    

      function isBusinessDay(date) {
        const dayOfWeek = date.getDay();
        return dayOfWeek !== 0 && dayOfWeek !== 6; // 0 is Sunday, 6 is Saturday
    }
    
    function getLast5BusinessDays() {
        let businessDays = [];
        let date = new Date(); // Today's date
    
        // Start from the previous day
        date.setDate(date.getDate() - 1);
    
        while (businessDays.length < 5) {
            if (isBusinessDay(date)) {
                // Format the date as "Dec 5"
                let formattedDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                businessDays.push(formattedDate);
            }
            // Go to the previous day
            date.setDate(date.getDate() - 1);
        }
    
        // Return the array without reversing
        return businessDays;
    }
    
    user.results = start_dash_data;
    user.stock_ticker = results.data.ticker;
    user.bus_day  = getLast5BusinessDays().reverse();
    user.stock_information = stock_ticker_data.data.results;
    req.session.user = user;
    req.session.save();


      res.render('pages/dashboard',{
        firstName: req.session.user.firstName,
        lastName: req.session.user.lastName,
        UserEmail: req.session.user.UserEmail,
        results: start_dash_data,
        stock_ticker: results.data.ticker,
        bus_day: getLast5BusinessDays().reverse(),
        stock_information: stock_ticker_data.data.results
      });
      
    }))
    .catch((err) => {
      res.render('pages/dashboard', {
        showModal: true,
        firstName: req.session.user.firstName,
        lastName: req.session.user.lastName,
        UserEmail: req.session.user.UserEmail,
        results: req.session.user.results,
        stock_ticker: req.session.user.stock_ticker,
        bus_day: req.session.user.bus_day,
        stock_information: req.session.user.stock_information,
  
        error: true,
        message: "That Is Not A Valid Ticker"
      });
    });

}


});



app.post('/login', async(req, res) =>{

  
  if(req.body.inputEmail == ""){
    res.render('pages/login', {
      error: true,
      message: "Please Enter an Email Address",
  });
  }

  if(req.body.inputPassword == ""){
    res.render('pages/login', {
      error: true,
      message: "Please Enter a Password",
  });
 }

 else{
    var query = `SELECT * FROM Users WHERE Users.UserEmail = '${req.body.inputEmail}'`;
    db.one(query).then( async (data) => {
      const match = await bcrypt.compare(req.body.inputPassword, data.password);

    if(data == null){
        res.redirect("/login");
    }

    if(match == true){
      
      user.firstName = data.firstname;
      user.lastName = data.lastname;
      user.UserEmail = data.useremail;

      req.session.user = user;

      req.session.save();
      //console.log(req.session.user.firstName);
      res.redirect('/login_page');

    }
    if(match == false){
      res.render("pages/login", {
        data: [],
        error: true,
        message: "Incorrect Password",
      });
    }
   })
   .catch((err) => {
    res.render("pages/login", {
      data: [],
      error: true,
      message: "Account Not Found",
    });
  });
 }
});


app.post('/usersignup', async(req, res) =>{

  if(req.body.inputEmail == ""){
    res.render('pages/signup', {
      error: true,
      message: "Please Enter an Email Address",
  });
  }
  if(req.body.firstName == ""){
    res.render('pages/signup', {
      error: true,
      message: "Please Enter a First Name",
  });
  }
  if(req.body.lastName == ""){
    res.render('pages/signup', {
      error: true,
      message: "Please Enter a Last Name",
  });
  }
  if(req.body.inputPassword == ""){
    res.render('pages/signup', {
      error: true,
      message: "Please Enter a Password",
  });
  }

  else{
    const hash = await bcrypt.hash(req.body.inputPassword, 10);
    var query = `INSERT INTO Users (UserEmail, firstName, lastName, Password) VALUES ('${req.body.inputEmail}', '${req.body.firstName}', '${req.body.lastName}', '${hash}');`;

    db.any(query)
      .then(function () {
        res.redirect('/login');
      });
  }
});
app.get('/*', (req, res) => {
  res.redirect('/main')
});

app.listen(3000);
console.log('Server is listening on port 3000');






app.listen(PORT, () => {
    console.log(`Server initiated on ${PORT}`);
});
