/**
 * User Schema
 */
const mongoose = require('mongoose')
const userSchema = new mongoose.Schema({
    username:
    {
        type: String,
        required: true
    },
    email:
    {
        type:String,
        required:true
    },
    password:
    {
        type:String,
        required:true
    },
    friends:
    {
        type: [mongoose.Schema.Types.ObjectId],
        required: false,
        ref: "User"
    },
    likedVideos:
    {
        type: [mongoose.Schema.Types.ObjectId],
        required: false,
        ref: "Video"
    }



})

module.exports = mongoose.model('User', userSchema)