const express = require('express')
const router = express.Router()
const Review = require('../models/review')
const Video = require('../models/video')
const Song = require('../models/review')

// check if logged in
function checkAuthenticated(req, res, next)
{

    if(req.isAuthenticated()) {
        return next()
    }

     res.redirect('/login')
}


// index route
router.get('/',  checkAuthenticated, async (req, res) => {

    // declare search and sort options
    let searchOptions = {}
    let sortOptions = {}

    // check if the field is not empty or null (prolly should change the "name" to something else)
    if(req.query.name != null & req.query.name !== "")
    {
        // create a regx
        searchOptions.title = new RegExp(req.query.name, 'i')
    }
      
    console.log("ooga"+req.query.sort);
    
    // newest chosen
    if(req.query.sort === "a")
    {
        sortOptions.datePosted = -1;
    }
    
    // oldest chosen
    else if(req.query.sort === "b")
    {
        sortOptions.datePosted = 1;
    }

    // highest average stars chosen
    else if(req.query.sort === "c")
    {

        sortOptions.averageStars = -1;
    }

    // sort by alphabetical title
    else if(req.query.sort === "d")
    {
        sortOptions.title = 1;
    }
  
    //try this
    try
    {
        // leave this when actually implementing sort and filter
        //const reviews = await Review.find(searchOptions).collation({locale: "en" }).sort(sortOptions)

        //find all reviews and populated the fields
        const reviews = await Review.find().populate([ 'video', 'user' ,'song', 'movie'])
      
        //render the html
        res.render('reviews/index', {
            reviews: reviews, 
            searchOptions: req.query,  
        })
    }

    // otherwise do this
    catch(e)
    {
        console.log(e)
        res.redirect('/')
    }

})

// new review get route
router.get('/new', checkAuthenticated, (req, res) => {
    
    //render this html
    res.render('reviews/new')
})

// create review router
router.post('/', checkAuthenticated,async (req, res) => {
    res.render('Create books')
})

// review/(id) get route
router.get('/:id', checkAuthenticated,async (req, res) => {

    //try this
    try 
    {
        // get the review corresponding with the url
        const review = await Review.findById(req.params.id).populate([ 'video', 'user' ,'song', 'movie'])

        // render the html and pass the reviews through
        res.render('reviews/view', {
            review: review
            //booksByVideo: books
        })
    } 
    
    // otherwise
    catch(e) 
    {
        console.log(e)
        res.redirect('/')
    }
})



module.exports = router