const express = require('express');
const router = express.Router();
const WrapAsync = require('../utils/WrapAsync');
const ExpressError = require('../utils/ExpressError');
const Coffeeplace = require('../models/Coffeeplace');
const { coffeeplaceSchema } = require('../schemas');



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

router.get('/', async (req,res) => {
    const allPlaces = await Coffeeplace.find({});
    res.render('coffeeplaces/index', {allPlaces});
});


router.get('/new', (req,res) => {
    res.render('coffeeplaces/new')
});
router.post('/', validateCoffeeplace, WrapAsync(async (req, res, next) => {
    //mistake: res.send(req.body);
    //leg: if(!req.body.coffeeplace) throw new ExpressError('Invalid Data', 400);
    const coffeeplace = new Coffeeplace(req.body.coffeeplace);
    //req.body was saved with 'coffeeplace' so we just parse that.
    await coffeeplace.save();
    res.redirect('/coffeeplaces');
}));



router.get('/:id', WrapAsync(async (req,res) => {
    const { id } = req.params;
    const coffeeplace = await Coffeeplace.findById(id).populate('reviews');
    if(!coffeeplace) throw new ExpressError('ID Not Found', 400);
    //I can't beilve I did error handling outside the course.
    //This has been a very difficult section.
    res.render('coffeeplaces/show', { coffeeplace });
}));


router.get('/:id/edit', WrapAsync(async (req,res) => {
    const coffeeplace = await Coffeeplace.findById(req.params.id);
    res.render('coffeeplaces/edit', { coffeeplace });
}));
router.put('/:id', validateCoffeeplace, WrapAsync(async (req,res) => {
    const { id } = req.params;
    const coffeeplace = await Coffeeplace.findByIdAndUpdate(id, {...req.body.coffeeplace},
        {runValidators: true, useFindAndModify: false, new: true}
    );
    res.redirect(`/coffeeplaces/${id}`);
}));

router.delete('/:id', WrapAsync(async(req,res) => {
    const { id } = req.params;
    const coffeeplace = await Coffeeplace.findByIdAndDelete(id);
    res.redirect('/coffeeplaces');
}));

module.exports = router;