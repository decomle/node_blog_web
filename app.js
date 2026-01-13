require('dotenv').config()

const { Template } = require('ejs');
const express = require('express');
const methodoverride = require('method-override');
const expressLayout = require('express-ejs-layouts')
const cookieParser = require('cookie-parser');

const connectDB = require('./server/config/db');
const session = require('express-session');
const MongoStore = require('connect-mongo').MongoStore;

const app = express();

connectDB()
const {isActiveRoute} = require('./server/helpers/routerHelpers')

app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(cookieParser());
app.use(methodoverride('_method'));

app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URI
    })
}))

app.use(express.static('static'))

// Templating engine
app.use(expressLayout);
app.set('layout', './layouts/main');
app.set('view engine', 'ejs');
app.set('views', 'templates');

app.locals.isActiveRoute = isActiveRoute;

const PORT = 5000 || process.env.PORT;

app.use('/', require('./server/routes/main'))
app.use('/admin', require('./server/routes/admin'))

app.listen(PORT, () => {
    console.log(`Listening to port ${PORT}`)
})