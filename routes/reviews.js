const express = require('express');
const router = express.Router({mergeParams: true});
const WrapAsync = require('../utils/WrapAsync');
const ExpressError = require('../utils/ExpressError');
const Review = require('../models/review');
const { validateReview } = require('../middleware')
const Coffeeplace = require('../models/Coffeeplace');


router.post('/', validateReview, WrapAsync(async (req, res) => {
    const{ id } = req.params;
    const coffeeplace = await Coffeeplace.findById(id);
    const review = new Review(req.body.review);
    coffeeplace.reviews.push(review);
    //I MISSED THIS STEP!!!!!
    //this is a review that was PASSSED through a place. but stored in a vacuum :(
    await review.save();
    await coffeeplace.save();
    req.flash('success', 'Successfully created a review!');
    res.redirect(`/coffeeplaces/${id}`);
}));

router.delete('/:reviewId', WrapAsync(async (req, res) => {
    const { id, reviewId} = req.params;
    await Coffeeplace.findByIdAndUpdate(id, { $pull: { review: reviewId } }, { useFindAndModify: false });
    //remove the review from the reviews array in the coffeeplace model
    await Review.findByIdAndDelete(reviewId, { useFindAndModify: false });
    //delete the review in the Review model (the straight forward one)
    req.flash('success', 'Successfully deleted your review!');
    res.redirect(`/coffeeplaces/${id}`);
}));

module.exports = router;