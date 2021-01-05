const { Router } = require('express');
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
        console.dir(registeredUser);
        req.flash('register', `Welcome to cawfeeplaces ${username}!`);
        res.redirect('/coffeeplaces');
    } catch(e) {
        req.flash('error', e.message);
        res.redirect('/register');
    }
}));

module.exports = router;