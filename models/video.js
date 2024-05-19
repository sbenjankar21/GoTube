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
        type: String,
        required: false,
        defualt: Date.now
    },
    imageAddress:
    {
        type: String,
        required: true
    }
})

module.exports = mongoose.model('Video', videoSchema)