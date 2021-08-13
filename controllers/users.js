const User = require('../models/user');

module.exports.registerFrom = (req, res) => {
    //TO DO: add constraint on password and better clinet-side validation response messages
    res.render('users/register');
};

module.exports.createUser = async (req, res) => {
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
};

module.exports.loginForm = (req, res) => {
    //TO DO: floating log in box (big picture: learn angular or/and react)
    res.render('users/login');
};

module.exports.login = (req, res) => {
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
};

module.exports.logout = (req, res) => {
    req.logout();
    req.flash('success', 'Goodbye');
    res.redirect('/coffeeplaces');
};