const express = require('express');
const router = express.Router();
const WrapAsync = require('../utils/WrapAsync');
const ExpressError = require('../utils/ExpressError');
const Coffeeplace = require('../models/Coffeeplace');
const { coffeeplaceSchema } = require('../schemas');
// const { isLoggedin } = require('../middleware');
const isLoggedin = (req, res, next) => {
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

const isAuthor = async(req, res, next) => {
    const { id } = req.params;
    const coffeeplace = Coffeeplace.findById(id);
    if(req.user._id && req.user._id.equals(coffeeplace.author)){
        next();
    } else {
        req.flash('error', 'invalid cordentials!');
        return res.redirect(`/coffeeplaces/${id}`);
    };
};

router.get('/', async (req,res) => {
    const allPlaces = await Coffeeplace.find({});
    res.render('coffeeplaces/index', {allPlaces});
});


router.get('/new', isLoggedin, (req, res, next) => {
    res.render('coffeeplaces/new')
});
router.post('/', isLoggedin, validateCoffeeplace, WrapAsync(async (req, res, next) => {
    //mistake: res.send(req.body);
    //leg: if(!req.body.coffeeplace) throw new ExpressError('Invalid Data', 400);
    const coffeeplace = new Coffeeplace(req.body.coffeeplace);
    //req.body was saved with 'coffeeplace' so we just parse that.
    coffeeplace.author = req.user._id
    // becuase db is not realtional we have to hardcode the foreign key
    await coffeeplace.save();
    req.flash('success', 'Successfully added a place!');
    res.redirect(`/coffeeplaces/${coffeeplace._id}`);
}));


router.get('/:id', WrapAsync(async (req,res) => {
    const { id } = req.params;
    const coffeeplace =  await Coffeeplace.findById(id).populate('reviews').populate('author');
    if(!coffeeplace) { 
        throw new ExpressError('Coffee place Not Found', 400);
        //OR
        //req.flash('error', 'Coffee place not found!');
    }
    //I can't beilve I did error handling outside the course.
    //This has been a very difficult section.
    res.render('coffeeplaces/show', { coffeeplace });
    //Flash: you can pass req.flas('success') to pass the msg
    //but that's not best practics!
}));


router.get('/:id/edit', isAuthor, WrapAsync(async (req,res) => {
    const coffeeplace_check = await Coffeeplace.findById(req.params.id)
    if(!req.user._id.equals(coffeeplace_check.author)){
        req.flash('error', 'Invalid crodentials')
        return res.redirect(`/coffeeplaces/${req.params.id}`)
    }
    const coffeeplace = await Coffeeplace.findById(req.params.id);
    if(!coffeeplace) { 
        throw new ExpressError('Coffee place Not Found', 400);
        //OR
        //req.flash('error', 'Coffee place not found!');
    }
    res.render('coffeeplaces/edit', { coffeeplace });
}));
router.put('/:id', isAuthor, validateCoffeeplace, WrapAsync(async (req,res) => {
    const { id } = req.params;
    const coffeeplace = await Coffeeplace.findByIdAndUpdate(id, {...req.body.coffeeplace},
        {runValidators: true, useFindAndModify: false, new: true}
    );
    req.flash('success', 'Successfully updated a place!');
    res.redirect(`/coffeeplaces/${id}`);
}));

router.delete('/:id', isAuthor, WrapAsync(async(req,res) => {
    const { id } = req.params;
    const coffeeplace = await Coffeeplace.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted a place!');
    res.redirect('/coffeeplaces');
}));

module.exports = router;