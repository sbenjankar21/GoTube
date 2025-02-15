/**
 * proxy router
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


// proxy router
router.get('/', checkAuthenticated, async (req, res) => {
    //try this
    try 
    {
    // make a call to the original request
    const original = await axios({
            method: 'get',
            url: req.query.link,
            responseType: 'arraybuffer'
        })
    
    // give the original calls response in the proxy response
    res.header("content-type", original.headers['content-type']).send(Buffer.from(original.data, 'binary'))

    } 
    
    //otherwise
    catch(e) 
    {
        console.log(e)
        res.redirect('/')
        console.log("u?hh")
    }
})

module.exports = router