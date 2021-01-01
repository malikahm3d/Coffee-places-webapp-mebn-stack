const express = require('express');
const router = express.Router({mergeParams: true});
const WrapAsync = require('../utils/WrapAsync');
const ExpressError = require('../utils/ExpressError');
const Review = require('../models/review');
const { reviewSchema } = require('../schemas');
const Coffeeplace = require('../models/Coffeeplace');



const validateReview = (req, res, next) => {
    const { err } = reviewSchema.validate(req.body);
    if(err){
        const msg = err.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}

router.post('/', validateReview, WrapAsync(async (req, res) => {
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

router.delete('/:reviewId', WrapAsync(async (req, res) => {
    const { id, reviewId} = req.params;
    await Coffeeplace.findByIdAndUpdate(id, { $pull: { review: reviewId } }, { useFindAndModify: false });
    //remove the review from the reviews array in the coffeeplace model
    await Review.findByIdAndDelete(reviewId, { useFindAndModify: false });
    //delete the review in the Review model (the straight forward one)
    res.redirect(`/coffeeplaces/${id}`);
}));

module.exports = router;