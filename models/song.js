/**
 * Video Schema
 */
const mongoose = require('mongoose')
const songSchema = new mongoose.Schema({
    title:
    {
        type: String,
        required: true
    },
    spotifyId:
    {
        type: String,
        required: true
    },
    artist:
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
    previewURL:
    {
        type: String,
        required: false,
   
    },
    backgroundColor:
    {
        type: String,
        required: false
    }

})

module.exports = mongoose.model('Song', songSchema)