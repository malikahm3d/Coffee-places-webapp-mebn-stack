const express = require('express');
const app = express();
const path = require('path')
const mongoose = require('mongoose');
const Coffeeplace = require('./models/Coffeeplace');
const methodOverride = require('method-override');
const engine = require('ejs-mate');
const WrapAsync = require('./utils/WrapAsync');
const ExpressError = require('./utils/ExpressError');
const Joi = require('joi');
const { coffeeplaceSchema, reviewSchema } = require('./schemas');
const Review = require('./models/review');
const coffeeplaces = require('./routes/coffeeplaces');
const reviews = require('./routes/reviews');
const session = require('express-session');
const flash = require('connect-flash');

mongoose.connect('mongodb://localhost:27017/cawfeeplaces', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false
});
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database Connected");
});

app.engine('ejs', engine);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({extended: true}));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

const sessionConfig = {
    secret: 'isthisasecret',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        //this is the default, but we still do it because SECURITY.
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
        //expires after a week from now. max age is a week.
    }
}
app.use(session(sessionConfig))
app.use(flash());

//middleware to catch all flash messages:
app.use((req, res, next) => {
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    //assigning the success flash to the loclas success.
    //we don't have to past it, we have access to it everywhere,
    //we delcared it globally.
    next();
    //REAMINDER: Always pass next at end middleware so you don't stop the app :I
});

app.use('/coffeeplaces', coffeeplaces);
app.use('/coffeeplaces/:id/reviews', reviews);

app.get('/', (req,res) => {
    res.render('home');
});


app.all('*', (req, res, next) => {
    next(new ExpressError('Page not found', 404));
    //when user goes to a non-exisisting page
});
app.use((err, req, res, next) => {
    //this is the generic error handler. this is where next() is thrown
    const { statusCode = 500 } = err;
    if(!err.message) message = 'Something universal went wrong';
    res.status(statusCode).render('errors', { err });
    //becuase this is where all our next()-s go, we only have to render errors.ejs once, here.
});


app.listen(3000, (req,res) => {
    console.log('listening on 3000');
});