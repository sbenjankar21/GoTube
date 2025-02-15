const express = require('express')
const router = express.Router()
const Movie = require('../models/movie')
const axios = require('axios')
const Review = require('../models/review')
const { parse } = require('dotenv')

// spotify api token
var spotify_token = "BQDc6o9uuqykQ8v2Rk-nvJetYFWAXAtMT6k46XSLp2BIOtLadit_B_fE7-juN61wHzOycx_f9yGOJmTLCydk4hFCmzUM3OeoFFZewvUHqckrLQt_flo"

//function to get additional data for a movie
async function getMoreData(movie) 
{
  try
  {
    const response = await axios({
      method: "get",
      url:"https://api.themoviedb.org/3/movie/"+movie.id+"?api_key=e1ebcaed511d642466017433aa7c2ec5&append_to_response=credits,videos"
    })

    return response.data;
  
  }

  catch(e)
  {
    console.log(e)
  }
}

//checks if logged in
function checkAuthenticated(req, res, next)
{
    if(req.isAuthenticated()) 
    {
      return next()
    }
    res.redirect('/login')
}


// movie index router
router.get('/', checkAuthenticated, async (req,res) =>{

  //get all movies
  const movies = await Movie.find()
    
  // render index html
  res.render('movies/index',{
    searchOptions: {},
    movies: movies
    })
})

// router.get('/search', checkAuthenticated, async (req,res) =>{
//     // request
//     const response = await axios({
//         method: 'GET',
//         url: 'https://api.spotify.com/v1/search?q='+req.query.title,

//         headers: {
//             Authorization: 'Bearer BQB5sGqhmPzngM45nKLKy6lq-rvwtMZlKQlUoOqlJW_q1PtJz8PQCok-QZFI_CFtQ46VrYkGkfOuHphxRyNY9ktzlx83ngAVAnafDVN_E9i4pY5tx0U'
//         }
//       });

// return res.send({songs: response})


// })


// movies/new router
router.get('/new', checkAuthenticated, async (req,res) =>{

    // render "new" html
  res.render('movies/new', {
  token: spotify_token,
  layout: false
  })

})



// router.post('/update-token', checkAuthenticated, async (req,res) => {

//   console.log("successfully connected")
//   console.log(req.body.newToken)
//   spotify_token = req.body.newToken

// })


// post to index router, this adds a movie to database and adds new review to database
router.post('/', checkAuthenticated, async (req,res) =>{

  // get the movie, rating, and content from the request
  var movie = req.body.movie
  var rating = req.body.rating
  var content = req.body.content
  
  // get additional data about the movie
  var movieMD = await getMoreData(movie)

  // try to do this
  try{
    // look for movies that have the same tmdbid as the movie from the request to ensure no duplicates
    var movies = await Movie.find({tmdbID: movieMD.id})

    // create a new movie
    const newMovie = new Movie(
    {
      title: movieMD.title,
      tmdbID: movieMD.id,
      director: movieMD.credits.crew.filter((member) => member.job == "Director")[0].name,
      totalStars: 5,
      stars: parseInt(rating),
      datePosted: Date.now(),
      imageAddress: movieMD.poster_path,
      averageStars: (parseInt(rating)/5* 5).toFixed(2),
      backdrop: movieMD.backdrop_path,
      releaseDate: movieMD.release_date,
      trailerYoutube: movieMD.videos.results.filter((result) => result.type == "Trailer")[0].key
    })

    //if movies is empty it means it is a movie not in the data base
    if(movies.length === 0)
    {
      // create a new review
      const newReview = Review({
        content: content,
        rating: parseInt(rating),
        movie: newMovie,
        user: req.user
      })
  
      // since its new save the movie and then redirect to the new movie page
      try
      {
      const createdMovie = await newMovie.save()
            res.redirect(`movies/${createdMovie.id}`)

      }

      //if something goes wrong render movies/new with error message (look at the stackoverflow in yoiur bookmark to impletment fetch rendering)
      catch(e)
      {
        console.log(e)

        res.render('movies/new',{
        song: movie,
        errorMessage: 'Error Creating Video...'
        })
      }


        // save the review to the database
        await newReview.save()

      }

      // the movie already exists in the database
      else
      {
        //already exist so use the movie found as the movie in the review
        const newReview = Review({
          content: content,
          rating: parseInt(rating),
          movie: movies[0],
          user: req.user

        })

          // save the review
          newReview.save()

          // set increasing to the movie rating
          let increasing = parseInt(rating)

          // get the movie
          let thisVid = await Movie.findOne({tmdbID: movieMD.id})

          // increase the movies stars
          let newStars = thisVid.stars + increasing;

          // increase the movies total stars
          let newTotalStars = thisVid.totalStars + 5;

          // calculate the new average stars
          let newAverageStars = (newStars/newTotalStars* 5).toFixed(2) 

          //update the movie with the previous info
          await Movie.updateOne({tmdbID: movieMD.id}, {$set:{stars:  newStars, totalStars: newTotalStars, averageStars: newAverageStars}})

          //find the updated movie
          var findTheMovie = await Movie.findOne({tmdbID: movieMD.id})

          //try to redirct to the updated moive
          try
          {
            res.redirect(`movies/${findTheMovie.id}`)
          }

          // otherwise log error
          catch(e)
          {
            console.log(e)
          }

      }

  }

  //otherwise log the error
  catch(e)
  {
    console.log(e)
    res.redirect('/')
    console.log("uhhhhhhhhhhhhhhhhhhhhhhhhhhhh")
  }

})


// movie/(id) router
router.get('/:id',checkAuthenticated, async (req, res) => {

  // try to get the movie corresponding to the id in the url
  try 
  {
    // get the movie by using the id form url
    const movie = await Movie.findById(req.params.id)

    // get all the reviews corresponding to the movie
    const reviews = await Review.find({movie: movie}).populate(["movie", "user"])

    // render html
    res.render('movies/view', {
      movie: movie,
      reviews: reviews
    })
  } 

  // if theres an error do this
  catch(e) 
  {
    console.log("IM HAVING ISSUEEEEEEEEEEEEES")
    res.redirect('/')
     
  }
})

module.exports = router