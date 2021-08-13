const express = require('express');
const router = express.Router({mergeParams: true});
const WrapAsync = require('../utils/WrapAsync');
const ExpressError = require('../utils/ExpressError');
const Review = require('../models/review');
const { validateReview, isLoggedin, isAuthorOfReview } = require('../middleware')
const Coffeeplace = require('../models/Coffeeplace');
const ReviewsController = require('../controllers/reviews');


router.post('/', isLoggedin, validateReview, WrapAsync(ReviewsController.create));
router.delete('/:reviewId', isLoggedin, isAuthorOfReview, WrapAsync(ReviewsController.delete));

module.exports = router;