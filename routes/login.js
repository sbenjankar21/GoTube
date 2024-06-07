const express = require('express')
const axios = require('axios')
const router = express.Router()
const passport = require('passport')
const initializePassport = require('../passport-config')
const flash = require('express-flash')
const session = require('express-session')
const bodyParser = require('body-parser')


//checks if the user is not logged in
function notAuthenticated(req, res, next)
{
    if(req.isAuthenticated()) {
        return res.redirect('/')
    }

    next()
}
router.get('/', notAuthenticated,(req, res) => {
    res.render('login/index',{layout: false})
})


router.post('/',  notAuthenticated, passport.authenticate('local',{
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true

}))


module.exports = router