const Coffeeplace = require('../models/Coffeeplace');
const ExpressError = require('../utils/ExpressError');

module.exports.index = async(req,res) => {
    const allPlaces = await Coffeeplace.find({});
    res.render('coffeeplaces/index', {allPlaces});
};

module.exports.new = (req, res, next) => {
    res.render('coffeeplaces/new')
};

module.exports.create = async (req, res, next) => {
    //mistake: res.send(req.body);
    //leg: if(!req.body.coffeeplace) throw new ExpressError('Invalid Data', 400);
    const coffeeplace = new Coffeeplace(req.body.coffeeplace);
    //req.body was saved with 'coffeeplace' so we just parse that.
    coffeeplace.author = req.user._id
    // becuase db is not realtional we have to hardcode the foreign key
    await coffeeplace.save();
    req.flash('success', 'Successfully added a place!');
    res.redirect(`/coffeeplaces/${coffeeplace._id}`);
};

module.exports.show = async (req,res) => {
    const { id } = req.params;
    const coffeeplace =  await Coffeeplace.findById(id).populate({
        path: 'reviews',
        perDocumentLimit: 5,
        populate: { path: 'author' }
    }).populate('author');
    if(!coffeeplace) { 
        throw new ExpressError('Coffee place Not Found', 400);
        //OR
        //req.flash('error', 'Coffee place not found!');
    }
    //I can't beilve I did error handling outside the course.
    //This has been a very difficult section.
    res.render('coffeeplaces/show', { coffeeplace });
    //Flash: you can pass req.flas('success') to pass the msg
    //but that's not best practics!
};

module.exports.edit = async (req,res) => {
    const coffeeplace = await Coffeeplace.findById(req.params.id);
    if(!coffeeplace) { 
        throw new ExpressError('Coffee place Not Found', 400);
        //OR
        //req.flash('error', 'Coffee place not found!');
    }
    res.render('coffeeplaces/edit', { coffeeplace });
};

module.exports.update = async (req,res) => {
    const { id } = req.params;
    const coffeeplace = await Coffeeplace.findByIdAndUpdate(id, {...req.body.coffeeplace},
        {runValidators: true, useFindAndModify: false, new: true}
    );
    req.flash('success', 'Successfully updated a place!');
    res.redirect(`/coffeeplaces/${id}`);
};

module.exports.delete = async(req,res) => {
    const { id } = req.params;
    const coffeeplace = await Coffeeplace.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted a place!');
    res.redirect('/coffeeplaces');
};