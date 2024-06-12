/**
 * Video Schema
 */
const mongoose = require('mongoose')
const movieSchema = new mongoose.Schema({
    title:
    {
        type: String,
        required: true
    },
    tmdbID:
    {
        type: String,
        required: true
    },
    director:
    {
        type: String,
        required: true
    },
    totalStars:
    {
        type: Number,
        required: true
    },
    stars:
    {
        type: Number,
        required: true
    },
    datePosted:
    {
        type: Date,
        required: true,
        
    },
    imageAddress:
    {
        type: String,
        required: true
    },
    averageStars:
    {
        type: Number,
        required: true
    },
    reviews:
    {
        type: [mongoose.Schema.Types.ObjectId],
        required: false,
        ref: "Review"
    },
    backgroundColor:
    {
        type: String,
        required: false
    },
    backdrop:
    {
        type: String,
        required: false
    },
    releaseDate:
    {
        type: String,
        required: true
    },
    trailerYoutube:
    {
        type: String,
        required: false
    }

})

module.exports = mongoose.model('Movie', movieSchema)