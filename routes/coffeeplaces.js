const express = require('express');
const router = express.Router();
const WrapAsync = require('../utils/WrapAsync');
const ExpressError = require('../utils/ExpressError');
const Coffeeplace = require('../models/Coffeeplace');
const { coffeeplaceSchema } = require('../schemas');
const { isLoggedin, isAuthor, validateCoffeeplace } = require('../middleware');
const Coffeeplacescontroller = require('../controllers/coffeeplaces');

router.get('/', WrapAsync(Coffeeplacescontroller.index));
router.get('/:id', WrapAsync(Coffeeplacescontroller.show));

router.get('/new', isLoggedin, Coffeeplacescontroller.new);
router.post('/', isLoggedin, validateCoffeeplace, WrapAsync(Coffeeplacescontroller.create));

router.get('/:id/edit', isLoggedin, isAuthor, WrapAsync(Coffeeplacescontroller.edit));
router.put('/:id', isLoggedin, isAuthor, validateCoffeeplace, WrapAsync(Coffeeplacescontroller.update));

router.delete('/:id', isLoggedin, isAuthor, WrapAsync(Coffeeplacescontroller.delete));

module.exports = router;