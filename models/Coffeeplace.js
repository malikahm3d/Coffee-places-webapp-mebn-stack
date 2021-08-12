const { ref } = require('joi');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Review = require('./review');
const User = require('./user')

const CoffeeplaceSchema = Schema({
    title: String,
    image: String,
    price: Number,
    descreption: String,
    location: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [{
        type: Schema.Types.ObjectId, ref: 'Review'
    }]
}, { timestamps: true });

CoffeeplaceSchema.post('findOneAndDelete', async function(doc){
    if(doc){
        await Review.deleteMany({
            _id: {
                $in: doc.reviews
            }
        })
    }
});

module.exports = mongoose.model('Coffeeplace', CoffeeplaceSchema);