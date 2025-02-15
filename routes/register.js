const express = require('express')
const axios = require('axios')
const router = express.Router()
const bcrypt = require('bcrypt')
const User = require('../models/user')
const Song = require('../models/song')

//checks if not logged in, redirects to home if logged in
function notAuthenticated(req, res, next)
{
    if(req.isAuthenticated()) {
        return res.redirect('/')
    }

    next()
}

// index router
router.get('/',notAuthenticated, async (req, res) => {
    res.render('register/index',{layout: false})
})


// psot router, handles user creatino
router.post('/', notAuthenticated,async (req, res) => {
    
    //try this
    try
    {
        // hash the password from the request
        const hashedPassword = await bcrypt.hash(req.body.password, 10)

        // create a new user with details
        const user = new User(
        {
            username: req.body.name,
            email: req.body.email,
            password : hashedPassword,
        })

        //save the user
        await user.save()

        // redirect to login page
        res.redirect('/login')
    }

    //otherwise do this
    catch(e){
        console.log(e)
        res.redirect('/register')
    }
})
module.exports = router