if(process.env.NODE_ENV !== 'production')
    {
        require('dotenv').config()
    }
    const User = require('./models/user')
    // const cors = require('cors')


    
const cookieParser = require("cookie-parser");
const express = require('express')
const axios = require('axios')
const app = express()
const expressLayouts = require('express-ejs-layouts')
const bodyParser = require('body-parser')
const flash = require('express-flash')
const session = require('express-session')
const passport = require('passport')
const initializePassport = require('./passport-config')
const methodOverride = require('method-override')
initializePassport(passport, email =>  User.findOne({email: email}),  id =>  User.findById(id)
)

// app.use(express.cookieParser('your secret option here'));
// app.use(express.session());
app.use(cookieParser());

const indexRouter = require('./routes/index')
const videoRouter  = require('./routes/videos')
const reviewRouter  = require('./routes/reviews')
const loginRouter = require('./routes/login')
const registerRouter = require('./routes/register')
const usersRouter = require('./routes/users')
const songsRouter = require('./routes/songs')
const moviesRouter = require('./routes/movies')
const proxyRouter = require('./routes/proxy')
const settingsRouter = require('./routes/settings')
const albumRouter = require('./routes/album')

app.set('view engine', 'ejs')
app.set('views', __dirname + '/views')
app.set('layout', 'layouts/layout')
app.use(expressLayouts)
app.use(express.static('public'))
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({limit: '10mb', extended: false}))
app.use(flash())
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave:false,
    saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))
const mongoose = require('mongoose')
mongoose.connect(process.env.DATABASE_URL, {
    useNewUrlParser: true
})
const db = mongoose.connection
db.on('error', error => console.error(error))
db.once('open', () => console.log("connected"))
app.use('/', indexRouter)
app.use('/videos', videoRouter)
app.use('/reviews', reviewRouter)
app.use('/login', loginRouter)
app.use('/register', registerRouter)
app.use('/users', usersRouter)
app.use('/songs', songsRouter)
app.use('/movies', moviesRouter)
app.use('/proxy', proxyRouter)
app.use('/settings', settingsRouter)
app.use('/albums', albumRouter)

app.delete('/logout', (req, res) => {
    req.logout(function(err) {
        if (err) { return next(err); }
        res.redirect('/');
      });
})
// app.use(cors({
//     origin: "*",
//     methods: "GET",
//     preflightContinue: false,
//     optionsSuccessStatus: 204,
//     credentials: true
//   }));

app.listen(process.env.PORT || 3000)