const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { User } = require('./user')


const reviewSchema = Schema({
    rating: {
        type: Number,
        enum: [1, 2, 3, 4, 5],
    },
    body: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
});

module.exports = mongoose.model('Review', reviewSchema);