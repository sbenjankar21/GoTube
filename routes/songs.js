const express = require('express')
const router = express.Router()
const Song = require('../models/song')
const axios = require('axios')
const Review = require('../models/review')
const { parse } = require('dotenv')

// spotify token (implement global variable hopefull, not a big deal really ig)
var spotify_token = "BQDc6o9uuqykQ8v2Rk-nvJetYFWAXAtMT6k46XSLp2BIOtLadit_B_fE7-juN61wHzOycx_f9yGOJmTLCydk4hFCmzUM3OeoFFZewvUHqckrLQt_flo"

//get the audiopreview url from the scraped html, it returns an array so dont trip
function extractAudioPreviewUrls(inputText) {
  const urls = [];
  const regex = /"audioPreview":\{"url":"(.*?)"/g;
  let match;

  while ((match = regex.exec(inputText)) !== null) {
      urls.push(match[1]);
  }

  return urls;
}

//get the background color value from the scraped html, it returns an array so dont trip
function extractBackgroundColors(inputText) {
  const colors = [];
  const regex = /--background-color:\s*([^;]+);/g;
  let match;

  while ((match = regex.exec(inputText)) !== null) {
      colors.push(match[1].trim());
  }

  return colors;
}

// check if logged in
function checkAuthenticated(req, res, next)
{

    if(req.isAuthenticated()) {
        return next()
    }

     res.redirect('/login')
}

// returns an array of bakcgorund color and audio preview url, takes a spotify id
async function getPreviewURL(trackId)
{
  const response = await axios({
    method: 'get',
    url: 'https://open.spotify.com/embed/track/'+trackId,
    responseType: 'document'
  })


  return [extractAudioPreviewUrls(response.data)[0], extractBackgroundColors(response.data)[0]]

}

// leaving this so i dont have to find it again

// async function getAuth()
// {
//     try{
//       //make post request to SPOTIFY API for access token, sending relavent info
//       const token_url = 'https://accounts.spotify.com/api/token';
//       //const data = qs.stringify({'grant_type':'client_credentials'});
//       data = "grant_type=client_credentials&client_id=dc276981aa7543689c8bbd74979846ce&client_secret=c058d32f7ada4598926d803f3024ce95"
  
//       const response = await axios({
//         method: 'post',
//         url: token_url,
//         data: {
//             grant_type: "client_credentials",
//             client_id: "dc276981aa7543689c8bbd74979846ce",
//             client_secret:"c058d32f7ada4598926d803f3024ce95"

//         },
//         headers: {
//             'Content-Type': 'application/x-www-form-urlencoded' 
//         }
//       });

//     //   const response = await axios.post(token_url, data, {
//     //     headers: { 
//     //       'Content-Type': 'application/x-www-form-urlencoded' 
//     //     }
//     //   })
//       //return access token
//       console.log(response)
//       return await response.data.access_token;
//       //consawole.log(response.data.access_token);   
//     }
//     catch(error){
//       //on fail, log the error in console
//       console.log("BROKe")
//       console.log(error);
//     }
//   }


// index route
router.get('/', checkAuthenticated, async (req,res) =>{
  // declare searchOptions and sortOptions
  let searchOptions = {}
  let sortOptions = {}

  // make sure the search isnt empty or null
  if(req.query.name != null & req.query.name !== "")
  {
    // create a regex
    searchOptions.title = new RegExp(req.query.name, 'i')
  }

  // sort by newest when its selected
  if(req.query.sort === "a")
  {
    sortOptions.datePosted = -1;
  }

  // sort by oldest when its selected
  else if(req.query.sort === "b")
  {
    sortOptions.datePosted = 1;
  }

  // sort by highest average stars when its selected
  else if(req.query.sort === "c")
  {
    sortOptions.averageStars = -1;
  }

  // sort by alphabetical when its selected
  else if(req.query.sort === "d")
  {
    sortOptions.title = 1;
  }

  // find the songs with the searchopitns and sort by the sortOptions, collation ensures it using standard english conventinons when sorting (lowercase isnt higher than uppercase etc.)
  const songs = await Song.find(searchOptions).collation({locale: "en" }).sort(sortOptions)

  // render the html
  res.render('songs/index', {
    searchOptions: req.query,
    songs: songs
  })

})

// deprecated i believe?
/*
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
*/


// new song route
router.get('/new', checkAuthenticated, async (req,res) =>{

  // render the html and pass the spotify token, layout is false cause its a bit different
    res.render('songs/new',{
        token: spotify_token,
        layout:false
    })

})


// post route to update the token
router.post('/update-token', checkAuthenticated, async (req,res) => {

  console.log("successfully connected")
  console.log(req.body.newToken)
  spotify_token = req.body.newToken

})

// post route creates a new song
router.post('/', checkAuthenticated, async (req,res) =>{
  // get info from the request
  var song = req.body.song
  var rating = req.body.rating
  var content = req.body.content
  
  // get the audio preview and background color
  var pURL = await getPreviewURL(song.id)

  // try this
  try
  {
    // find songs that have the same id as the requested song
    var songs = await Song.find({spotifyId: song.id})

    // create new song
    const newSong = new Song(
    {
      title: song.name,
      spotifyId: song.id,
      artist: song.artists[0].name,
      totalStars: 5,
      stars: parseInt(rating),
      datePosted: Date.now(),
      imageAddress: song.album.images[0].url,
      averageStars: (parseInt(rating)/5* 5).toFixed(2),
      previewURL: pURL[0],
      backgroundColor: pURL[1]
    })

    // if songs with the same is length is 0 than its a new song
    if(songs.length === 0)
      {
        // create a new review
        const newReview = Review({
          content: content,
          rating: parseInt(rating),
          song: newSong,
          user: req.user
        })

        // save the review
        await newReview.save()

        //try this
        try
        {
          // save the song
          const createdSong = await newSong.save()
          
          // redirect to the songs page
          res.redirect(`songs/${createdSong.id}`)

        }

        // othewise
        catch(e)
        {
            console.log(e)

            //render the page again with error message (need to fix the fetch rendering)
            res.render('songs/new',{
                song: song,
                errorMessage: 'Error Creating Video...',
                token: spotify_token
            })
        }
      }

      // otherwise the song already exists in the database
      else
      {
        //create a new review and pass in the song thats already in the database
        const newReview = Review({
          content: content,
          rating: parseInt(rating),
          song: songs[0],
          user: req.user

        })

        //save the review
        newReview.save()
        
        // declare increasing to be the rating from the request
        let increasing = parseInt(rating)

        // find the existing song
        let thisVid = await Song.findOne({spotifyId: song.id})

        // calculate the new rating
        let newStars = thisVid.stars + increasing;

        // calculate the new total stars
        let newTotalStars = thisVid.totalStars + 5;

        // calculate the new average stars
        let newAverageStars = (newStars/newTotalStars* 5).toFixed(2) 

        // update the song with the new values from above
        await Song.updateOne({spotifyId: song.id}, {$set:{stars:  newStars, totalStars: newTotalStars, averageStars: newAverageStars}})

        // try tis
        try
        {
          // redirect to the songs page
          res.redirect(`songs/${thisVid.id}`)
      
        }

        // otherwise
        catch(e)
        {
          console.log(e)
        }
      }

  }

  //otherwise redirect home and log an error (maaybe fix rendering later)
  catch(e)
  {
    console.log(e)
    res.redirect('/')
    console.log("uhhhhhhhhhhhhhhhhhhhhhhhhhhhh")
  }

})


// song page router
router.get('/:id',checkAuthenticated, async (req, res) => {

  //try this
  try 
  {
    // get the song using the id from the url
    const song = await Song.findById(req.params.id)

    // get all the corresponding reviews and populated the values
    const reviews = await Review.find({song: song}).populate("song").populate("user")

    // render the html
    res.render('songs/view', {
      song: song,
      reviews: reviews
      //booksByVideo: books
    })

  } 
  
  //otherwise
  catch(e) 
  {
    //log the error and redirect to the song index
    console.log(e)
    res.redirect('/songs')
     
  }
  
})

module.exports = router