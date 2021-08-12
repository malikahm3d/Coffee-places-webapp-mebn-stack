const express = require('express');
const router = express.Router();
const User = require('../models/user');
const WrapAsync = require('../utils/WrapAsync');
const passport = require('passport')

const passportLoginMiddleware =  passport.authenticate('local', {
failureRedirect: '/login',
failureFlash: 'invalid username or password'
//notes on passport authenticate middleware:
//This is set to local (as supposed to google or twitter (which is a to do))
//it has a failure redirect to the same page
//it flashes messages based on conidtion (it has pre-set messgaes, but we overwrote them)
});


//sign up
router.get('/register', (req, res) => {
    //TO DO: add constraint on password and better clinet-side validation response messages
    res.render('users/register');
});
router.post('/register', WrapAsync(async (req, res) => {
    try{
        const { username, password, email } = req.body;
        const user = new User({ username, email });
        //we split it like this so that passport handles all the hashing
        const registeredUser = await User.register(user, password);

        //loggin in upon signing up, use req.login(user, cb)
        req.login(registeredUser, (e) => {
            if (e) return next(e);
            req.flash('success', `Welcome to cawfeeplaces ${username}!`);
            res.redirect('/coffeeplaces');
        });     
    } catch(e) {
        req.flash('error', e.message);
        //if error, add flash with apporpoiate messgae from the error handler
        //and redirect to the register page
        //TO DO: flash the message without refreshing the page (i.e. without deleting any valid input)
        res.redirect('/register');
    }
}));


//login
router.get('/login', (req, res) => {
    //TO DO: floating log in box (big picture: learn angular or/and react)
    res.render('users/login');
});
router.post('/login', passportLoginMiddleware, (req, res) => {
    // const redirectURL = req.session.returnTo || '/coffeeplaces'
    // if(!req.session.returnTo){
    //     //if the user isn't bring redirected, welcome them back.
    //     req.flash('success', 'welcome back!')
    // }
    //redirect the user the page they we previosly on
    //if thats not the case, redicet to /coffeeplaces
    //delete req.session.returnTo;
    //this line is probably not neccessary
    res.redirect('/coffeeplaces');
});

//log out
router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success', 'Goodbye');
    res.redirect('/coffeeplaces');
});

module.exports = router;