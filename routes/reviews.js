const express = require('express')
const router = express.Router()
const Review = require('../models/review')
const Video = require('../models/video')
const Song = require('../models/review')
function checkAuthenticated(req, res, next)
{

    if(req.isAuthenticated()) {
        return next()
    }

     res.redirect('/login')
}
// all books route
router.get('/',  checkAuthenticated, async (req, res) => {

    let searchOptions = {}
    let sortOptions = {}
    if(req.query.name != null & req.query.name !== "")
    {
        searchOptions.title = new RegExp(req.query.name, 'i')
    }
      
    console.log("ooga"+req.query.sort);
    
    if(req.query.sort === "a")
    {
        sortOptions.datePosted = -1;
    }
    
    else if(req.query.sort === "b")
    {
        sortOptions.datePosted = 1;
    }

    else if(req.query.sort === "c")
    {

        sortOptions.averageStars = -1;
    }

    else if(req.query.sort === "d")
    {
        sortOptions.title = 1;
    }
  
    try
    {
        //const reviews = await Review.find(searchOptions).collation({locale: "en" }).sort(sortOptions)
        const reviews = await Review.find().populate([ 'video', 'user' ,'song', 'movie'])
      
        console.log("heeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeppposdf")
        console.log(reviews)
      
        //const test = rev = await Review.find()
        //console.log(test[1]);
        res.render('reviews/index', {
            reviews: reviews, 
            searchOptions: req.query,  
        })
    }

    catch(e)
    {
        console.log(e)
        res.redirect('/')
    }

})

// new author route
router.get('/new', checkAuthenticated, (req, res) => {
  res.render('reviews/new')
})

// create authro router
router.post('/', checkAuthenticated,async (req, res) => {
    res.render('Create books')
})
// new view
router.get('/:id', checkAuthenticated,async (req, res) => {
    try 
    {
        const review = await Review.findById(req.params.id).populate([ 'video', 'user' ,'song', 'movie'])
        //const books = await Book.find({ video: video.id }).limit(6).exec()
        res.render('reviews/view', {
            review: review
            //booksByVideo: books
        })
    } 
    
    catch 
    {
        res.redirect('/')
        console.log("uhh")
    }
})



module.exports = router