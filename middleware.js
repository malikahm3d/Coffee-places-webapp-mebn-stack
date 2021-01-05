const isLoggedin = (req, res, next) => {
    if(!req.isAuthenticated()){
        //req.session.returnTo = req.originalURL
        //get where the user is coming from
        req.flash('error', 'You must be logged in to submit a new place');
        return res.redirect('/login')
        //don't forget to RETURN the error redirect
        //so you don't get ERR_HTTP_HEADERS_SENT
        //basically more than one res is sent
    }
    next();
}

module.exports = isLoggedin;