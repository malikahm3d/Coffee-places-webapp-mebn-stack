const express = require('express');
const router = express.Router();
const User = require('../models/user');
const WrapAsync = require('../utils/WrapAsync');
const passport = require('passport')
const UsersController = require('../controllers/users');

const passportLoginMiddleware =  passport.authenticate('local', {
failureRedirect: '/login',
failureFlash: 'invalid username or password'
//notes on passport authenticate middleware:
//This is set to local (as supposed to google or twitter (which is a to do))
//it has a failure redirect to the same page
//it flashes messages based on conidtion (it has pre-set messgaes, but we overwrote them)
});


//sign up
router.get('/register', UsersController.registerFrom);
router.post('/register', WrapAsync(UsersController.createUser));


//login
router.get('/login', UsersController.loginForm);
router.post('/login', passportLoginMiddleware, UsersController.login);

//log out
router.get('/logout', UsersController.logout);

module.exports = router;