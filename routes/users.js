const express = require('express')
const router = express.Router()
const Review = require('../models/review')
const User = require('../models/user')

// check if logged in
function checkAuthenticated(req, res, next)
{

    if(req.isAuthenticated()) {
        return next()
    }

     res.redirect('/login')
}

// index router
router.get('/', checkAuthenticated, async (req,res) => {

  // find all users
  const myUsers = await User.find()

  // render the html
  res.render('users/index',{
      users: myUsers
  })
})


// user page router
router.get('/:id', checkAuthenticated,async (req, res) => {

  try 
  {
    // current user is the user page currently viewing
    const currentUser = await User.findById(req.params.id).populate('friends').populate('likedVideos').populate({ path: 'favoriteSongs favoriteMovies', options: { retainNullValues: true } })

    // get the reviews by the user
    const reviewsByUser = await Review.find({user: currentUser}).populate("video").populate('user')

    // sesssion uer is the user logged in
    const sessionUser = req.user;

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

  // psot router for friends however will probaly change
  router.post('/:id', checkAuthenticated,async (req, res) => {
    
  try
  {

    //current user is the user that the logged in user is attempting to friend
    const currentUser = await User.findById(req.params.id).populate('friends')

    // session user is the logged in user
    const sessionUser = await req.user.populate("friends");

    // look though the logged in friends and see if they are already friends
    if(sessionUser.friends.find(friend => {
      return friend._id.equals(currentUser._id)
    }) !== undefined)
    {
      console.log("already friends")
    }

    // otherwise they are not friends
    else
    {

    // update teh logged in users friends lsit and add the user to friends
    await User.updateOne({ _id: req.user.id }, { $push: { friends: currentUser } })
      
    }

   // redirect to the same page 
   res.redirect('/users/'+req.params.id)

  }

  // otherwise do this
  catch(e)
  {

    //log the error and redirect to users index
    console.log(e)
    res.redirect('/users')

  }
})
module.exports = router