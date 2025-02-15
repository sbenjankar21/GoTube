/**
 * Index router
 */
const express = require('express')
const axios = require('axios')
const router = express.Router()

// checks if user is logged in
function checkAuthenticated(req, res, next)
{
    if(req.isAuthenticated()) 
    {
        return next()
    }

    res.redirect('/login')
}

//  home route
router.get('/', checkAuthenticated,(req, res) => {

    // on url visit display this html
    res.render('index', {name: req.user.username})
  
})

module.exports = router