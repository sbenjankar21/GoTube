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
    },
    favoriteSongs:
    {
        type: [mongoose.Schema.Types.Mixed],
        required: false,
        ref: "Song",
        default: [null, null, null, null, null]
    }



})

module.exports = mongoose.model('User', userSchema)