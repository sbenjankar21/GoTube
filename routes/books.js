const express = require('express')
const router = express.Router()
const Book = require('../models/video')
// all books route
router.get('/',  async (req, res) => {

    res.send('All books')
})

// new author route
router.get('/new', (req, res) => {
  res.send('New book')
})

// create authro router
router.post('/', async (req, res) => {
    res.send('Create books')
})

module.exports = router