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

// app.get('/media', (req, res) => {
//     axios({
//       method: 'get',
//       url: req.query.media,
//       responseType: 'arraybuffer'
//     })
//     .then((result) => {
//        res
//          .header("content-type", result.headers['content-type'])
//          .send(Buffer.from(result.data, 'binary')
//     });
//   });

router.get('/', async (req, res) => {
    try {
        console.log("HI MOM")
        const original = await axios({
            method: 'get',
            url: req.query.link,
            responseType: 'arraybuffer'
        })

        res.header("content-type", original.headers['content-type']).send(Buffer.from(original.data, 'binary'))
       // console.log(original.data)
       //res.setHeader('Content-Type', 'image/jpeg')
        //res.send(original.data)

      } catch(e) {
        console.log(e)
       res.redirect('/')
       console.log("u?hh")
      }
})

module.exports = router