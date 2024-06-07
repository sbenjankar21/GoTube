const express = require('express')
const axios = require('axios')
const router = express.Router()
const bcrypt = require('bcrypt')
const User = require('../models/user')

function notAuthenticated(req, res, next)
{
    if(req.isAuthenticated()) {
        return res.redirect('/')
    }

    next()
}

router.get('/',notAuthenticated, async (req, res) => {
    res.render('register/index',{layout: false})

})

router.post('/', notAuthenticated,async (req, res) => {
    
    try
    {
        console.log(req.body.password)
        const hashedPassword = await bcrypt.hash(req.body.password, 10)
        const user = new User(
            {
                username: req.body.name,
                email: req.body.email,
                password : hashedPassword

            })
            const newUser = await user.save()

            console.log(await User.findOne())
            res.redirect('/login')
    }

    catch(e){
        console.log(e)
        res.redirect('/register')
    }
})
module.exports = router