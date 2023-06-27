//******** all requirement *********
require('dotenv').config();

// const res = require('express/lib/response');
const express = require('express');
//require express layout
const expressLayout = require('express-ejs-layouts');
//for editing and updating blogs
const methodOverride = require('method-override');
//cookieparser to stay looged in
const cookieParser = require('cookie-parser');
const MongoStore = require('connect-mongo');
const session = require('express-session');

//require database 
const connectDB = require('./server/config/db');
const { isActiveRoute } = require('./server/helpers/routeHelpers');
//express is listening at port 5000
const app = express();
const PORT = process.env.PORT || 5000;


//connecting to database
connectDB();

//few middlewares so that search works
app.use(express.urlencoded({ extended: true}));
app.use(express.json());
app.use(methodOverride('_method'));

//adding cookieparser as middleware
app.use(cookieParser());
//for sessions
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URI
    }),
  //cookie: { maxAge: new Date ( Date.now() + (3600000) ) } 
}));

// set a public folder for all js css images etc
app.use(express.static('public'));

// setting Templating Engine
app.use(expressLayout);
app.set('layout','./layouts/main');  //set default layout ./layout/main is the location
app.set('view engine', 'ejs');  //set view engine + this also requires a views folder (express default setting)

app.locals.isActiveRoute = isActiveRoute;

//seperating routes for different page
app.use('/',require('./server/routes/main')); //home page
app.use('/',require('./server/routes/admin')); //admin page


app.listen(PORT, ()=> {
    console.log(`App Listening on port ${PORT}`);
});

