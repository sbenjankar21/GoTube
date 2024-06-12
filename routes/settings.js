/**
 * Index router
 */
const express = require('express')
const axios = require('axios')
const router = express.Router()
const User = require('../models/user')
const Song = require('../models/song')
var spotify_token = "BQDc6o9uuqykQ8v2Rk-nvJetYFWAXAtMT6k46XSLp2BIOtLadit_B_fE7-juN61wHzOycx_f9yGOJmTLCydk4hFCmzUM3OeoFFZewvUHqckrLQt_flo"
// checks if user is logged in
function checkAuthenticated(req, res, next)
{
    if(req.isAuthenticated()) 
    {
        return next()
    }

    res.redirect('/login')
}

// app.get('/media', (req, res) => {
//     axios({
//       method: 'get',
//       url: req.query.media,
//       responseType: 'arraybuffer'
//     })
//     .then((result) => {
//        res
//          .header("content-type", result.headers['content-type'])
//          .send(Buffer.from(result.data, 'binary')
//     });
//   });

router.get('/',checkAuthenticated, async (req, res) => {
    try {
      var usersa = await User.find().populate("favoriteSongs")
      var usersb = await User.find()
      console.log(usersa)
      console.log(usersb)
        res.render('settings/view', {
            user: req.user,
            reviews: [],
            token: spotify_token
            //booksByVideo: books
          })
      } catch(e) {
        console.log(e)
        res.redirect("/")
      }
})

router.post('/update-token', checkAuthenticated, async (req,res) => {

    console.log("successfully connected")
    console.log(req.body.newToken)
    spotify_token = req.body.newToken
  
  })


  router.post('/',checkAuthenticated, async (req, res) => {
    var newListString = req.body.songs;
    console.log("INPUT")
    console.log(newListString)
    var newArray = newListString.split("SHRAWAN")
    //console.log(newArray)
    var songarray = []
    for(var i = 0; i < newArray.length; i++)
      {
        newArray[i] = JSON.parse(newArray[i])
        console.log(newArray[i])
        if(newArray[i] !== null)
          {
        songarray.push(new Song(
          {
              title: newArray[i].title,
              spotifyId: newArray[i].id,
              artist: newArray[i].artist,
              totalStars: 5,
              stars: 0,
              datePosted: Date.now(),
              imageAddress: newArray[i].imageAddress,
              averageStars: 0,

          }))
        }

        else
        {
          songarray.push(null)
        }


      }



    try {
console.log(songarray)
//await Song.updateOne({spotifyId: song.id}, {$set:{stars:  newStars, totalStars: newTotalStars, averageStars: newAverageStars}})
var user = req.user;

await User.updateOne({_id: req.user._id}, {$set:{favoriteSongs: songarray}})
console.log("SUCCESSS")
var usersa = await User.find()
console.log(usersa)
console.log(user)
res.redirect("/")



      } catch(e) {
        res.redirect("/")
      }



})
  
module.exports = router