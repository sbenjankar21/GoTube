const express = require('express')
const router = express.Router()
const Video = require('../models/video')
const Review = require('../models/review')
const User = require('../models/user')
const axios = require('axios')


// check if logged in
function checkAuthenticated(req, res, next)
{

    if(req.isAuthenticated()) {
        return next()
    }

     res.redirect('/login')
}

// function to make a request to a url
async function httpGet(theUrl)
{
    // try this
    try
    {
        const response = await axios({
            method: 'GET',
            url: theUrl
        });

        return response.data;

    }

    // otherwise
    catch(error)
    {
        // if theres an error do this stuff but i never bothered to fill it out probaly should
        if(error.response)
        {

        }

        else if(error.request)
        {

        }
        else
        {

        }
        console.log(error.config)
    }
}

//gets the youtube id from a link
function getSecondPart(str) {
    var mySubString

    if(str.indexOf("https://youtu.be/") !== -1)
    {
        mySubString = str.substring(
            str.lastIndexOf("/") + 1, 
            str.indexOf("?")
        );
    }
    
    else if(str.indexOf("&") !== -1)
    {
        mySubString = str.substring(
            str.indexOf("=") + 1, 
            str.indexOf("&")
        );
    }

    else
    {
        mySubString = str.split('=')[1];
    }

    return mySubString;
}

// index route
router.get('/', checkAuthenticated, async (req, res) => {

    // declare search options and sortoptons
    let searchOptions = {}
    let sortOptions = {}

    // make sure the req field isnt blank maybe change the name
    if(req.query.name != null & req.query.name !== "")
    {
        // create a regex
        searchOptions.title = new RegExp(req.query.name, 'i')
    }

    // sort by newest
    if(req.query.sort === "a")
    {
        sortOptions.datePosted = -1;
    }

    // sort by oldest
    else if(req.query.sort === "b")
    {
        sortOptions.datePosted = 1;
    }

    //sort by highest average
    else if(req.query.sort === "c")
    {
        sortOptions.averageStars = -1;
    }

    // sort by alphabetically title
    else if(req.query.sort === "d")
    {
        sortOptions.title = 1;
    }

    //try this
    try
    {
        // find all the viedes with the searchoptions and use the sortOption, collation makes sure... just look it up bruh
        const videos = await Video.find(searchOptions).collation({locale: "en" }).sort(sortOptions)

        // render the html
        res.render('videos/index', {
            videos: videos, 
            searchOptions: req.query,
        })
    }

    // other wise
    catch(e)
    {
        // log the error and redirect to home page
        console.log(e)
        res.redirect('/')
    }


})

// new video route
router.get('/new', checkAuthenticated,(req, res) => {
    res.render('videos/new', { video: new Video(), layout: false})
})

//console.log("test" + httpGet('https://www.googleapis.com/youtube/v3/videos?part=snippet&id=MouZdENJddQ&fields=items(id,snippet)&key=AIzaSyARlc8Jj0BqWyLS7DpFbkyZ6SHNyUepuqQ'))
router.post('/', checkAuthenticated,async (req, res) => {
    // get the info from the request
    var text = req.body.link;
    var rating = req.body.rating;
    var con = req.body.content;

    // try this
    try
    {
    // video api link
    var url = 'https://www.googleapis.com/youtube/v3/videos?part=snippet&id='+getSecondPart(text)+'&fields=items(id,snippet)&key=AIzaSyARlc8Jj0BqWyLS7DpFbkyZ6SHNyUepuqQ'

    // make a request to the api and record the response in vid
    var vid = await httpGet(url)

    // look for vides with the same imageAddress
    var vids = await Video.find({imageAddress: "https://img.youtube.com/vi/"+getSecondPart(text)+"/hq720.jpg"});

    // ion know why i did this but too lazy to fix it
    var videoJson = vid //------

    // create a new video
    const video = new Video(
    {
        title: videoJson.items[0].snippet.title,
        link: text,
        author: videoJson.items[0].snippet.channelTitle,
        totalStars: 5,
        stars: parseInt(rating),
        datePosted: Date.now(),
        imageAddress: "https://img.youtube.com/vi/"+getSecondPart(text)+"/hq720.jpg",
        averageStars: (parseInt(rating)/5* 5).toFixed(2),
        youtubeId: getSecondPart(text),
        backgroundColor: req.body.bgcolor
    })


    // if vids length is 0 that means its a new video
    if(vids.length === 0)
    {
        // create a new review
        const review = new Review(
        {
            content: con,
            rating: parseInt(rating),
            video: video,
            user: req.user

        })

        // save the review
        await review.save()

        // try this
        try
        {
            // save the video
            const newVideo = await video.save()

            // redirect to the new video's page
            res.redirect(`videos/${newVideo.id}`)

        }

        // on error do this
        catch(e)
        {
            // log the error and render the page agian with an error message
            console.log(e)
            res.render('videos/new',{
                video: video,
                errorMessage: 'Error Creating Video...'
            })
        }
    }

    // otherwise the video already exists
    else
    {
        // create a new review
        const review = new Review(
        {
            content: con,
            rating: parseInt(rating),
            video: vids[0],
            user: req.user

        })

        //save the review
        await review.save()

        // the rating from the request
        let increasing = parseInt(rating)

        // find the vid that already exists
        let thisVid = await Video.findOne({imageAddress: "https://img.youtube.com/vi/"+getSecondPart(text)+"/hq720.jpg"})

        // calculate the new given stars
        let newStars = thisVid.stars + increasing;

        // caluclate the new total stars
        let newTotalStars = thisVid.totalStars + 5;

        // calculate the new average stars
        let newAverageStars = (newStars/newTotalStars* 5).toFixed(2) 

        // find the existing video and update the values with the ones above
        await Video.updateOne({imageAddress: "https://img.youtube.com/vi/"+getSecondPart(text)+"/hq720.jpg"}, {$set:{stars:  newStars, totalStars: newTotalStars, averageStars: newAverageStars}})

        // render the html FIX IT BITCHHH IT DOESNT WORK
        res.render('videos/new',{
            video: vids[0],
            errorMessage: 'review made'
        })
        
    }
             
    }

    // otherwiese
    catch(e)
    {
        // log the error and render the page again with an error message
        console.log(e)
        res.render('videos/new',{
            video: {link: req.body.name},
            errorMessage: 'Error Creating Video...'
        })
    }
})

// new view route
router.get('/:id',checkAuthenticated, async (req, res) => {

    // try this
    try 
    {
        // get the video from the url id
        const video = await Video.findById(req.params.id)

        // get the corresponding reviews
        const reviews = await Review.find({video: video}).populate(["video","user"])

        // render the page 
        res.render('videos/view', {
            video: video,
            reviews: reviews
            //booksByVideo: books
        })

    } 
    
    //otherwise
    catch 
    {
        // redirect home
        res.redirect('/')
    }
})


// new like post router
router.post('/:id/new-like', checkAuthenticated, async(req,res) =>
{
    // try this
    try{

        // find the video the user is trying to like
        const video = await Video.findById(req.params.id)

        // get the session user and populate values
        const sessionUser = await req.user.populate("likedVideos friends");

        // check to see if the video is already liked from the user
        if(sessionUser.likedVideos.find(vidInArray => {
                return vidInArray._id.equals(video._id)
        }) !== undefined)
        {
        console.log("already liked")
        }
        
        // otherwise the vi has not been liked
        else
        {
            // find the user by update and add the vid to their liked videos
            await User.updateOne({ _id: req.user.id },{ $push: { likedVideos: video } })
        }
    }

    // on error
    catch(e)
    {

        // log the error and redirect to home page
        console.log(e)
        res.redirect('/')

    }
})
module.exports = router