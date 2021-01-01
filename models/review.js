const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const reviewSchema = Schema({
    rating: {
        type: Number,
        enum: [1, 2, 3, 4, 5],
    },
    body: String
});

module.exports = mongoose.model('Review', reviewSchema);