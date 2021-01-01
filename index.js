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

mongoose.connect('mongodb://localhost:27017/cawfeeplaces', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
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


const validateCoffeeplace = (req, res, next) => {
    const { err } = coffeeplaceSchema.validate(req.body);
    //there is no client-side validation for a post route
    //so we used the JOI package to validate the schema values inside the coffeeplace object
    //and the coffeeplace object itself.
    //PS: we named the object coffeeplace[attribute] in the 'name' part of the body
    if(err){
        const msg = err.details.map(el => el.message).join(',');
        //const msg2 = err.details.message.join(',');

        //the err.details.messgae is an array, we use map to speerate them
        //and join them at ',' into a string that we pass to ExpressError()
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
};

const validateReview = (req, res, next) => {
    const { err } = reviewSchema.validate(req.body);
    if(err){
        const msg = err.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }


}

app.get('/', (req,res) => {
    res.render('home');
});

app.get('/coffeeplaces', async (req,res) => {
    const allPlaces = await Coffeeplace.find({});
    res.render('coffeeplaces/index', {allPlaces});
});


app.get('/coffeeplaces/new', (req,res) => {
    res.render('coffeeplaces/new')
});
app.post('/coffeeplaces', validateCoffeeplace, WrapAsync(async (req, res, next) => {
    //mistake: res.send(req.body);
    //leg: if(!req.body.coffeeplace) throw new ExpressError('Invalid Data', 400);
    const coffeeplace = new Coffeeplace(req.body.coffeeplace);
    //req.body was saved with 'coffeeplace' so we just parse that.
    await coffeeplace.save();
    res.redirect('/coffeeplaces');
}));

app.post('/coffeeplaces/:id/reviews', validateReview, WrapAsync(async (req, res) => {
    const{ id } = req.params;
    const coffeeplace = await Coffeeplace.findById(id);
    const review = new Review(req.body.review);
    coffeeplace.reviews.push(review);
    //I MISSED THIS STEP!!!!!
    //this is a review that was PASSSED through a place. but stored in a vacuum :(
    await review.save();
    await coffeeplace.save()
    res.redirect(`/coffeeplaces/${id}`);
}));

app.get('/coffeeplaces/:id', WrapAsync(async (req,res) => {
    const { id } = req.params;
    const coffeeplace = await Coffeeplace.findById(id).populate('reviews');
    if(!coffeeplace) throw new ExpressError('ID Not Found', 400);
    //I can't beilve I did error handling outside the course.
    //This has been a very difficult section.
    res.render('coffeeplaces/show', { coffeeplace });
}));


app.get('/coffeeplaces/:id/edit', WrapAsync(async (req,res) => {
    const coffeeplace = await Coffeeplace.findById(req.params.id);
    res.render('coffeeplaces/edit', { coffeeplace });
}));
app.put('/coffeeplaces/:id', validateCoffeeplace, WrapAsync(async (req,res) => {
    const { id } = req.params;
    const coffeeplace = await Coffeeplace.findByIdAndUpdate(id, {...req.body.coffeeplace},
        {runValidators: true, useFindAndModify: false, new: true}
    );
    res.redirect(`/coffeeplaces/${id}`);
}));

app.delete('/coffeeplaces/:id', WrapAsync(async(req,res) => {
    const { id } = req.params;
    const coffeeplace = await Coffeeplace.findByIdAndDelete(id);
    res.redirect('/coffeeplaces');
}));

app.delete('/coffeeplaces/:id/reviews/:reviewId', WrapAsync(async (req, res) => {
    const { id, reviewId} = req.params;
    await Coffeeplace.findByIdAndUpdate(id, { $pull: { review: reviewId } }, { useFindAndModify: false });
    //remove the review from the reviews array in the coffeeplace model
    await Review.findByIdAndDelete(reviewId, { useFindAndModify: false });
    //delete the review in the Review model (the straight forward one)
    res.redirect(`/coffeeplaces/${id}`);
}));
//leg: app.get('/makecoffeeplace', async (req,res) => {
//     const place = Coffeeplace({ title: 'coffee lang', descreption: 'p good'});
//     await place.save(); 
//     res.send(place);

// });
app.all('*', (req, res, next) => {
    next(new ExpressError('Page not found', 404));
});
app.use((err, req, res, next) => {
    //this is the generic error handler. this is where next() is thrown
    const { statusCode = 500 } = err;
    if(!err.message) message = 'Something universal went wrong';
    res.status(statusCode).render('errors', { err });
    //becuase this is where all our next()-s go, we only have to render errors.ejs once, here.
});
// app.use((req,res) => {
//     res.status(404).send('not found');
// });
app.listen(3000, (req,res) => {
    console.log('listening on 3000');
});