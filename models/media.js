/**
 * Video Schema
 */
const mongoose = require('mongoose')
const movieSchema = new mongoose.Schema({
    mediaType:
    {
        type: String,
        required: true
    },
    mediaId:
    {
        type: String,
        required: true
    },
    title:
    {
        type: String,
        required: true
    },

    author:
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
    }
})

module.exports = mongoose.model('Movie', movieSchema)