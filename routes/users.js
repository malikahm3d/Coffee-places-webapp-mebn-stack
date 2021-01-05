const express = require('express');
const router = express.Router();
const User = require('../models/user');
const WrapAsync = require('../utils/WrapAsync');


router.get('/register', (req, res) => {
    res.render('users/register');
});
router.post('/register', WrapAsync(async (req, res) => {
    try{
        const { username, password, email } = req.body;
        const user = new User({ username, email });
        const registeredUser = await User.register(user, password);
        //we split it like this so that passport handles all the hashing
        req.flash('success', `Welcome to cawfeeplaces ${username}!`);
        //if succes, add flash message and redircet the user to index page
        res.redirect('/coffeeplaces');
    } catch(e) {
        req.flash('error', e.message);
        //if error, add flash with apporpoiate messgae from the error handler
        //and redirect to the regester page
        //TO DO: flash the message without refreshing the page (i.e. without deleting any valid input)
        res.redirect('/register');
    }
}));

module.exports = router;