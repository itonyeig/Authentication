require('dotenv').config()
const express = require("express")
const bodyParser = require("body-parser")
const ejs = require("ejs")
const mongoose = require('mongoose')
const session = require('express-session')
const passport = require('passport')
const passportLocalMongoose = require('passport-local-mongoose');

const app = express()

app.set('view engine', 'ejs')

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"))

app.use(session({
  secret: process.env.SECRET_2,
  resave: false,
  saveUninitialized: false,
}))

app.use(passport.initialize())
app.use(passport.session())

mongoose.connect('mongodb://localhost:27017/userDB', { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false})

const userSchema =  new mongoose.Schema({
    email: String,
    password: String
})

userSchema.plugin(passportLocalMongoose);

const User = new mongoose.model('User', userSchema)

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get('/', function (req, res) {
  res.render('home')
})

app.get('/login', function (req, res) {
  res.render('login')
})

app.get('/secrets',function(req,res){
    //do something only if user is authenticated
    if(req.isAuthenticated()){
        res.render('secrets')
        
    } else{
        res.redirect("/login");
    }
});


app.get('/register', function (req, res) {
  res.render('register')
})

app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
})

app.post('/register', function (req, res) {

  User.register({username: req.body.username}, req.body.password, function (err, user) {
    if (err) {
      console.log(err);
      res.redirect('/register')
    } else {
      passport.authenticate('local')(req, res, function () {
        res.redirect('/secrets')
      })
    }
  })
})

app.post('/login', passport.authenticate('local', { failureRedirect: '/login' }),function(req, res) {

    res.redirect('/secrets');
});
  //   req.login(user, function (err) {
  //     if (err) {
  //     console.log(err);
  //   } else {
  //     passport.authenticate('local')(req, res, function () {
  //       res.redirect('/secrets')
  //     })
  //   }
  // })
// })

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
