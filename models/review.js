/**
 * Review schema
 */
const mongoose = require('mongoose')
const reviewSchema = new mongoose.Schema({
    content:
    {
        type: String,
        required: true
    },
    rating:
    {
        type: Number,
        required: true
    },
    video:
    {
        type: mongoose.Schema.Types.ObjectId,
        required: false,
        ref: "Video"
    },
    song:
    {
        type: mongoose.Schema.Types.ObjectId,
        required: false,
        ref: "Song"
    },
    movie:
    {
        type: mongoose.Schema.Types.ObjectId,
        required: false,
        ref: "Movie"
    },
    album:
    {
        type: mongoose.Schema.Types.ObjectId,
        required: false,
        ref: "Album"
    },
    user:
    {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User"
    }


})

module.exports = mongoose.model('Review', reviewSchema)