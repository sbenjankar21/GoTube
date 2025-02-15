/**
 * Index router
 */
const express = require('express')
const axios = require('axios')
const router = express.Router()
const User = require('../models/user')
const Song = require('../models/song')
const Movie = require('../models/movie')
//spotify token
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

// returns an array containing backgorund color and a preview audio url, takes a spotify id
async function getPreviewURL(trackId)
{
  const response = await axios({
    method: 'get',
    url: 'https://open.spotify.com/embed/track/'+trackId,
    responseType: 'document'
  })

  var content = response.data

  return [extractAudioPreviewUrls(response.data)[0], extractBackgroundColors(response.data)[0]]

}
//get more movie from move
async function getMoreData(movieId) 
{
  try
  {
    const response = await axios({
      method: "get",
      url:"https://api.themoviedb.org/3/movie/"+movieId+"?api_key=e1ebcaed511d642466017433aa7c2ec5&append_to_response=credits,videos"
    })

    return response.data;
  
  }

  catch(e)
  {
    console.log(e)
  }
}

// setting index route
router.get('/',checkAuthenticated, async (req, res) => {
   
  // finds the logged in user and populates favoriteSongs
  var populatedUser = await User.findById(req.user._id).populate({ path: 'favoriteSongs favoriteMovies', options: { retainNullValues: true } })
  
  // render html and pass through values
  res.render('settings/view', {
      user: populatedUser,
      reviews: [],
      token: spotify_token
  })

})

//update the token when needed
router.post('/update-token', checkAuthenticated, async (req,res) => {

    console.log("successfully connected")
    console.log(req.body.newToken)
    spotify_token = req.body.newToken
  
})

// post to settings (update)
router.post('/',checkAuthenticated, async (req, res) => {
  // get the favorite songs from the request
  var newArray = req.body.songs
  var movieArray = req.body.movies
  
  //declare the newSongArray
  var newSongArray = []
  var newMovieArray = []
  
  // loop through the favorite songs from request
  for(var i = 0; i < newArray.length; i++)
  {
    // if current index not null
    if(newArray[i] !== null)
    {
      // find songs with the same spootifyid as the current index
      var songsWithSameId = await Song.find({spotifyId: newArray[i].id})

      // if its 0 that means its not in the database
      if(songsWithSameId.length === 0)
      {
        // get the background color and audio preview url with the spotify id
        var pURL = await getPreviewURL(newArray[i].id)

        // create a new song with 0's for the star fields
        const newSong =  new Song(
        {
          title: newArray[i].title,
          spotifyId: newArray[i].id,
          artist: newArray[i].artist,
          totalStars: 0,
          stars: 0,
          datePosted: Date.now(),
          imageAddress: newArray[i].imageAddress,
          averageStars: 0,
          previewURL: pURL[0],
          backgroundColor: pURL[1]
        })

        // save the song to the database
        newSong.save()

        //add the song to the new favorite song array
        newSongArray.push(newSong)

      }

      //if the songs is already in the database than just add that to the new favorite song array
      else
      {
        newSongArray.push(songsWithSameId[0])
      }

    }

    // if it is null
    else
    {

      //than add null to the new favorite song array
      newSongArray.push(null)
    }

  }

  // loop through the favorite movies from request
  for(var i = 0; i < movieArray.length; i++)
    {
      // if current index not null
      if(movieArray[i] !== null)
      {
        // find songs with the same spootifyid as the current index
        var moviesWithSameId = await Movie.find({tmdbID: movieArray[i].id})
  
        // if its 0 that means its not in the database
        if(moviesWithSameId.length === 0)
        {
          // get the background color and audio preview url with the spotify id
          //var pURL = await getPreviewURL(newArray[i].id)
          var movieMD = await getMoreData(movieArray[i].id)
  
          // create a new song with 0's for the star fields
          const newMovie = new Movie(
            {
              title: movieMD.title,
              tmdbID: movieMD.id,
              director: movieMD.credits.crew.filter((member) => member.job == "Director")[0].name,
              totalStars: 0,
              stars: 0,
              datePosted: Date.now(),
              imageAddress: movieMD.poster_path,
              averageStars: 0,
              backdrop: movieMD.backdrop_path,
              releaseDate: movieMD.release_date,
              trailerYoutube: movieMD.videos.results.filter((result) => result.type == "Trailer")[0].key
            })
  
          // save the song to the database
          newMovie.save()
  
          //add the song to the new favorite song array
          newMovieArray.push(newMovie)
  
        }
  
        //if the songs is already in the database than just add that to the new favorite song array
        else
        {
          newMovieArray.push(moviesWithSameId[0])
        }
  
      }
  
      // if it is null
      else
      {
  
        //than add null to the new favorite song array
        newMovieArray.push(null)
      }
  
    }





  //try this
  try 
  {
    //find the user in the database with the same id as the one logged in and change the olf favorite song array to the new one just created
    await User.updateOne({_id: req.user._id}, {$set:{favoriteSongs: newSongArray, favoriteMovies:newMovieArray}})

    // for when we actually implement fetch rendering, or alternativly we can jsut do the client side and see if the request is good (res.send(200)) or something like that
    // res.render("/settings/view", {success = "true"})

  } 
  
  // if theres an error
  catch(e) 
  {
    console.log(e)
  }

})
  
module.exports = router