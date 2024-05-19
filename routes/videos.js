const express = require('express')
const router = express.Router()
const Video = require('../models/video')
var xm = require('xhr2');
const axios = require('axios')

// all videos route

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
router.get('/',  async (req, res) => {
    let searchOptions = {}
    if(req.query.name != null & req.query.name !== "")
        {
            searchOptions.title = new RegExp(req.query.name, 'i')
        }
    try
    {
        const videos = await Video.find(searchOptions)
        res.render('videos/index', {
            videos: videos, 
            searchOptions: req.query
        })
    }

    catch
    {
        res.redirect('/')
    }


})

// new video route
router.get('/new', (req, res) => {
    res.render('videos/new', { video: new Video()})
})

//console.log("test" + httpGet('https://www.googleapis.com/youtube/v3/videos?part=snippet&id=MouZdENJddQ&fields=items(id,snippet)&key=AIzaSyARlc8Jj0BqWyLS7DpFbkyZ6SHNyUepuqQ'))
router.post('/', async (req, res) => {
    var text = req.body.name;
    var url = 'https://www.googleapis.com/youtube/v3/videos?part=snippet&id='+getSecondPart(text)+'&fields=items(id,snippet)&key=AIzaSyARlc8Jj0BqWyLS7DpFbkyZ6SHNyUepuqQ'
    var vid = await httpGet(url)
var videoJson = vid //------
    const video = new Video(
        {
            title: videoJson.items[0].snippet.title,
            link: req.body.name,
            author: videoJson.items[0].snippet.channelTitle,
            totalStars: 0,
            stars: 0,
            imageAddress: "https://i.ytimg.com/vi/"+getSecondPart(req.body.name)+"/hqdefault.jpg?sqp=-oaymwEbCKgBEF5IVfKriqkDDggBFQAAiEIYAXABwAEG&rs=AOn4CLBARGZBBqHOTN_h8uL6tGJ8dslkKg"
        })
    

        try
        {
            const newVideo = await video.save()
             res.redirect(`videos/${newVideo.id}`)
                       // res.redirect('videos')
        }
        catch
        {
            res.render('videos/new',{
                video: video,
                errorMessage: 'Error Creating Video...'
            })
        }
        // video.save().
        // then((newVideo)=>{
        //     res.render('videos')
        // }).
        // catch((err)=>{
        //     res.render('videos/new',{
        //         video: video,
        //         errorMessage: 'Error Creating Video...'
        //   
        // })

})

// new view route
router.get('/:id', async (req, res) => {
    try {
        const video = await Video.findById(req.params.id)
        //const books = await Book.find({ video: video.id }).limit(6).exec()
        res.render('videos/view', {
          video: video
          //booksByVideo: books
        })
      } catch {
       res.redirect('/')
       console.log("uhh")
      }
})
module.exports = router