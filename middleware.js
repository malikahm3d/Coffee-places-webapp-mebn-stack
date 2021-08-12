const { ExpressError } = require('./utils/ExpressError');
const { coffeeplaceSchema, reviewSchema } = require('./schemas.js');
const Coffeeplace = require('./models/Coffeeplace');

module.exports.isLoggedin = (req, res, next) => {
    if(!req.isAuthenticated()){
        //req.session.returnTo = req.originalURL
        //get where the user is coming from
        req.flash('error', 'You must be logged in to submit a new place');
        return res.redirect('/login')
        //don't forget to RETURN the error redirect
        //so you don't get ERR_HTTP_HEADERS_SENT
        //basically more than one res is sent
    }
    next()
};

module.exports.validateCoffeeplace = (req, res, next) => {
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

module.exports.isAuthor = async(req, res, next) => {
    const { id } = req.params;
    const coffeeplace = await Coffeeplace.findById(id);
    if(!coffeeplace.author.equals(req.user._id)){
        req.flash('error', 'invalid cordentials!');
        return res.redirect(`/coffeeplaces/${id}`);
    }
    next();
};

module.exports.validateReview = (req, res, next) => {
    const { err } = reviewSchema.validate(req.body);
    if(err){
        const msg = err.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    };
};