const express = require('express')
const router = express.Router()
const Video = require('../models/video')
const Review = require('../models/review')
const User = require('../models/user')
var xm = require('xhr2');
const axios = require('axios')


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
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded' 
        },
        data: data
      });

    //   const response = await axios.post(token_url, data, {
    //     headers: { 
    //       'Content-Type': 'application/x-www-form-urlencoded' 
    //     }
    //   })
      //return access token
      console.log(response.data.access_token)

      return await response.data.access_token;
      //consawole.log(response.data.access_token);   
    }


    catch(error){
      //on fail, log the error in console
      console.log("BROKe")
      console.log(error);
    }
  }


// all videos route
function checkAuthenticated(req, res, next)
{

    if(req.isAuthenticated()) {
        return next()
    }

     res.redirect('/login')
}
async function httpGet(theUrl)
{

    // const response = await fetch(theUrl)
    // const info = await response.json()
    // console.log(info)


    try
    {
        const response = await axios({
            method: 'GET',
            url: theUrl
        });
        console.log(theUrl)
        console.log(response.data)
        return response.data;

    }
    catch(error)
    {
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

function getSecondPart1(str) {

       return mySubString = str.split('=')[1];

}
router.get('/', checkAuthenticated, async (req, res) => {
    console.log("AUTHORIZE")
   //console.log(getAuth())
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
        const videos = await Video.find(searchOptions).collation({locale: "en" }).sort(sortOptions)
        res.render('videos/index', {
            videos: videos, 
            searchOptions: req.query,
            
            
        })
    }

    catch(e)
    {
        console.log(e)
        res.redirect('/')
    }


})

// new video route
router.get('/new', checkAuthenticated,(req, res) => {
    res.render('videos/new', { video: new Video()})
})

//console.log("test" + httpGet('https://www.googleapis.com/youtube/v3/videos?part=snippet&id=MouZdENJddQ&fields=items(id,snippet)&key=AIzaSyARlc8Jj0BqWyLS7DpFbkyZ6SHNyUepuqQ'))
router.post('/', checkAuthenticated,async (req, res) => {

    var text = req.body.name;
    var rating = req.body.rating;
    var con = req.body.content;
    try
    {
    var url = 'https://www.googleapis.com/youtube/v3/videos?part=snippet&id='+getSecondPart(text)+'&fields=items(id,snippet)&key=AIzaSyARlc8Jj0BqWyLS7DpFbkyZ6SHNyUepuqQ'
    var vid = await httpGet(url)
     var vids = await Video.find({imageAddress: "https://img.youtube.com/vi/"+getSecondPart(text)+"/hq720.jpg"});
     console.log(vids.length)
     var videoJson = vid //------
     const video = new Video(
         {
             title: videoJson.items[0].snippet.title,
             link: req.body.name,
             author: videoJson.items[0].snippet.channelTitle,
             totalStars: 5,
             stars: parseInt(rating),
             datePosted: Date.now(),
             imageAddress: "https://img.youtube.com/vi/"+getSecondPart(req.body.name)+"/hq720.jpg",
             averageStars: (parseInt(rating)/5* 5).toFixed(2)
         })


     if(vids.length === 0)
        {
         const review = new Review(
             {
                 content: con,
                 rating: parseInt(rating),
                 video: video,
                 user: req.user
 
             })
             const newReview = await review.save()
        }
    else
    {
        const review = new Review(
            {
                content: con,
                rating: parseInt(rating),
                video: vids[0],
                user: req.user

            })
            const newReview = await review.save()
    }
             
     if(vids.length === 0)
        {
            console.log("new")

            console.log(Review.findOne())
        try
        {
            const newVideo = await video.save()

             res.redirect(`videos/${newVideo.id}`)
                       // res.redirect('videos')
        }
        catch(e)
        {
            console.log(e)
            res.render('videos/new',{
                video: video,
                errorMessage: 'Error Creating Video...'
            })
        }
        }

        else{
            
            let temp = 5;
            let increasing = parseInt(rating)
            let thisVid = await Video.findOne({imageAddress: "https://img.youtube.com/vi/"+getSecondPart(text)+"/hq720.jpg"})
            let newStars = thisVid.stars + increasing;
            let newTotalStars = thisVid.totalStars + 5;
            let newAverageStars = (newStars/newTotalStars* 5).toFixed(2) 
            await Video.updateOne({imageAddress: "https://img.youtube.com/vi/"+getSecondPart(text)+"/hq720.jpg"}, {$set:{stars:  newStars, totalStars: newTotalStars, averageStars: newAverageStars}})


                res.render('videos/new',{
                    video: vids[0],
                    errorMessage: 'review made'
                })
            
        }
    }
    catch(e)
    {
        console.log(e)
        res.render('videos/new',{
            video: {link: req.body.name},
            errorMessage: 'Error Creating Video...'
        })
    }
})

// new view route
router.get('/:id',checkAuthenticated, async (req, res) => {
    try {
        const video = await Video.findById(req.params.id)
        const reviews = await Review.find({video: video}).populate("video")

        //const books = await Book.find({ video: video.id }).limit(6).exec()
        res.render('videos/view', {
          video: video,
          reviews: reviews
          //booksByVideo: books
        })
      } catch {
       res.redirect('/')
       console.log("uhh")
      }
})

router.post('/:id/new-like', checkAuthenticated, async(req,res) =>
{
    try{
        const video = await Video.findById(req.params.id)
        const sessionUser = await req.user.populate("likedVideos friends");



            if(sessionUser.likedVideos.find(vidInArray => {

                return vidInArray._id.equals(video._id)
              }) !== undefined)
              {
                console.log("already liked")
              }
        
              else
              {
                console.log("not liked!")
                await User.updateOne(
                    { _id: req.user.id },
                    { $push: { likedVideos: video } })
          }
    }
    catch(e)
    {
        console.log(e)
        res.redirect('/')

    }
})
module.exports = router