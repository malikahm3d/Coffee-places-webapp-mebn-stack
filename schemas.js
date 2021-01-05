const Joi = require('joi');

module.exports.coffeeplaceSchema = Joi.object({
    coffeeplace: Joi.object({
    title: Joi.string().required(),
    price: Joi.number().min(0).required(),
    image: Joi.string().required(),
    descreption: Joi.string().required(),
    location: Joi.string().required
}).required()
});

module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number().required().min(1).max(5)
    }).required()
});
// const coffeeplaceSchema = Joi.object({
//     coffeeplace: Joi.object({
//     title: Joi.string().required(),
//     price: Joi.number().min(0).required(),
//     image: Joi.string().required(),
//     descreption: Joi.string().required(),
//     location: Joi.string().required
// }).required()
// });
