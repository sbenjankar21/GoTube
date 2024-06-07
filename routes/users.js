const express = require('express')
const router = express.Router()
const Review = require('../models/review')
const User = require('../models/user')
function checkAuthenticated(req, res, next)
{

    if(req.isAuthenticated()) {
        return next()
    }

     res.redirect('/login')
}
router.get('/', checkAuthenticated, async (req,res) =>{
    const myUsers = await User.find()
    res.render('users/index',{
        users: myUsers
    })
})

router.get('/:id', checkAuthenticated,async (req, res) => {
    try {
        const currentUser = await User.findById(req.params.id).populate('friends').populate('likedVideos')
        const reviewsByUser = await Review.find({user: currentUser}).populate("video").populate('user')
        const sessionUser = req.user;
        //const books = await Book.find({ video: video.id }).limit(6).exec()
        console.log("eeeeeeeee")
        console.log(currentUser.username)
        res.render('users/view', {
          user: currentUser,
          reviews: reviewsByUser,
          sesUser: sessionUser
          //booksByVideo: books
        })
      } catch(e) {
        console.log(e)
       res.redirect('/')

      }
  })

  router.post('/:id', checkAuthenticated,async (req, res) => {
    try
    {
      const currentUser = await User.findById(req.params.id).populate('friends')
      const reviewsByUser = await Review.find({user: currentUser}).populate("video").populate('user')
      const sessionUser = await req.user.populate("friends");
      //const currentUser = await User.findById(req.params.id)
      console.log("testing starts here")
      console.log(sessionUser)
      // console.log(sessionUser.friends.find(friend => friend._id == currentUser._id))
      if(sessionUser.friends.find(friend => {
        console.log("entry")
        console.log(friend)
        console.log(currentUser)
        return friend._id.equals(currentUser._id)
      }) !== undefined)
      {
        console.log("already friends")
      }

      else
      {
        console.log("not freidns!")
        await User.updateOne(
      { _id: req.user.id },
      { $push: { friends: currentUser } }
   )
  }
//console.log(req.user.id)
   console.log(await User.findById(req.user.id).populate('friends'))
   res.redirect('/users/'+req.params.id)
  //  res.render('users/view', {
  //   user: currentUser,
  //   reviews: reviewsByUser,
  //   sesUser: sessionUser
  //   //booksByVideo: books
  // })
  }
  catch(e)
  {
    console.log(e)
    res.redirect('/users')
  }
  })
module.exports = router