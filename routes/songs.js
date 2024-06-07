const express = require('express')
const router = express.Router()
const Song = require('../models/song')
const axios = require('axios')
const Review = require('../models/review')
const { parse } = require('dotenv')

var spotify_token = "BQDc6o9uuqykQ8v2Rk-nvJetYFWAXAtMT6k46XSLp2BIOtLadit_B_fE7-juN61wHzOycx_f9yGOJmTLCydk4hFCmzUM3OeoFFZewvUHqckrLQt_flo"

function checkAuthenticated(req, res, next)
{

    if(req.isAuthenticated()) {
        return next()
    }

     res.redirect('/login')
}

async function getAuth()
{
    try{
      //make post request to SPOTIFY API for access token, sending relavent info
      const token_url = 'https://accounts.spotify.com/api/token';
      //const data = qs.stringify({'grant_type':'client_credentials'});
      data = "grant_type=client_credentials&client_id=dc276981aa7543689c8bbd74979846ce&client_secret=c058d32f7ada4598926d803f3024ce95"
  
      const response = await axios({
        method: 'post',
        url: token_url,
        data: {
            grant_type: "client_credentials",
            client_id: "dc276981aa7543689c8bbd74979846ce",
            client_secret:"c058d32f7ada4598926d803f3024ce95"

        },
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded' 
        }
      });

    //   const response = await axios.post(token_url, data, {
    //     headers: { 
    //       'Content-Type': 'application/x-www-form-urlencoded' 
    //     }
    //   })
      //return access token
      console.log(response)
      return await response.data.access_token;
      //consawole.log(response.data.access_token);   
    }
    catch(error){
      //on fail, log the error in console
      console.log("BROKe")
      console.log(error);
    }
  }

router.get('/', checkAuthenticated, async (req,res) =>{
    const songs = await Song.find()

  console.log(songs)
    res.render('songs/index',{
        //users: myUsers
        searchOptions: {},
        songs: songs
    })
})

router.get('/search', checkAuthenticated, async (req,res) =>{
    //const myUsers = await User.find()
    console.log("connected!")
    const response = await axios({
        method: 'GET',
        url: 'https://api.spotify.com/v1/search?q='+req.query.title,

        headers: {
            Authorization: 'Bearer BQB5sGqhmPzngM45nKLKy6lq-rvwtMZlKQlUoOqlJW_q1PtJz8PQCok-QZFI_CFtQ46VrYkGkfOuHphxRyNY9ktzlx83ngAVAnafDVN_E9i4pY5tx0U'
        }
      });
    //const search = req.params.title;
    //var songQuery = await Song.find({title: search}).collation({locale: "en" })
return res.send({songs: response})


})


router.get('/new', checkAuthenticated, async (req,res) =>{
   // const myUsers = await User.find()
   //console.log(getAuth()) //------------------
    res.render('songs/new',{
        token: spotify_token
    })
})



router.post('/update-token', checkAuthenticated, async (req,res) => {

  console.log("successfully connected")
  console.log(req.body.newToken)
  spotify_token = req.body.newToken

})


router.post('/', checkAuthenticated, async (req,res) =>{
  var song = req.body.song
  var rating = req.body.rating
  var content = req.body.content
  
 // console.log(req)
  //console.log(res.json())
  //console.log("going through hereeee")
  //console.log(rating)
  try{
    var songs = await Song.find({spotifyId: song.id})
    const newSong = new Song(
      {
          title: song.name,
          spotifyId: song.id,
          artist: song.artists[0].name,
          totalStars: 5,
          stars: parseInt(rating),
          datePosted: Date.now(),
          imageAddress: song.album.images[0].url,
          averageStars: (parseInt(rating)/5* 5).toFixed(2)
      })
    if(songs.length === 0)
      {
        //new
        const newReview = Review({
          content: content,
          rating: parseInt(rating),
          song: newSong,
          user: req.user

        })

        await newReview.save()
      }

      else
      {
        //already exist
        const newReview = Review({
          content: content,
          rating: parseInt(rating),
          song: songs[0],
          user: req.user

        })

          newReview.save()
      }

      if(songs.length === 0)
        {
           // console.log("new")

           // console.log(Review.findOne())
        try
        {
            const newSong2 = await newSong.save()

             res.redirect(`songs/${newSong2.id}`)
                       // res.redirect('videos')
        }
        catch(e)
        {
            console.log(e)
            res.render('songs/new',{
                song: song,
                errorMessage: 'Error Creating Video...',
                token: spotify_token
            })
        }
        }

        else{
            
            let temp = 5;
            let increasing = parseInt(rating)
            let thisVid = await Song.findOne({spotifyId: song.id})
            let newStars = thisVid.stars + increasing;
            let newTotalStars = thisVid.totalStars + 5;
            let newAverageStars = (newStars/newTotalStars* 5).toFixed(2) 
            await Song.updateOne({spotifyId: song.id}, {$set:{stars:  newStars, totalStars: newTotalStars, averageStars: newAverageStars}})
            let findTheSong = await Song.findOne({spotifyId: song.id})
              console.log("updated!!!")
              try
              {
                res.redirect(`songs/${findTheSong.id}`)
              
                // res.render('index',{
                //     song: songs[0],
                //     errorMessage: 'review made',
                //     token: spotify_token,
                //     name: "bullshit"
                // })
              }

            catch(e)
            {
              console.log(e)
            }
        }

      //await newSong.save()
      //console.log("SONG SAVED!!1")
      //return res.redirect(`songs/${newSong.id}`)
      //console.log("y u still here")
  }

  catch(e)
  {
    console.log(e)
    res.redirect('/')
    console.log("uhhhhhhhhhhhhhhhhhhhhhhhhhhhh")
  }
    //const myUsers = await User.find()
    // res.render('users/index',{
    //     //users: myUsers
    // })
})

router.get('/:id',checkAuthenticated, async (req, res) => {
  try {
      const song = await Song.findById(req.params.id)
      const reviews = await Review.find({song: song}).populate("song")

      //const books = await Book.find({ video: video.id }).limit(6).exec()
      res.render('songs/view', {
        song: song,
        reviews: reviews
        //booksByVideo: books
      })
    } catch(e) {
      console.log("IM HAVING ISSUEEEEEEEEEEEEES")
     res.redirect('/songs')
     
    }
})

module.exports = router