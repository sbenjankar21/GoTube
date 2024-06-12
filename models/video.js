/**
 * Video Schema
 */
const mongoose = require('mongoose')
const videoSchema = new mongoose.Schema({
    title:
    {
        type: String,
        required: true
    },
    link:
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
    },
    youtubeId:
    {
        type: String,
        required: true
    },
    backgroundColor:
    {
        type: String,
        required: false
    }
})

module.exports = mongoose.model('Video', videoSchema)