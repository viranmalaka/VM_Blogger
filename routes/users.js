var express = require('express');
var router = express.Router();
var User  = require('../models/User');
var passport = require('passport');
var LocalStrategy = require('passport-local');

/* Get Register. */
router.get('/588c36b1d8f0b14b2a91f7f2', isLogIn, function(req, res, next) {
    if(req.user.admin){
        res.render('users/reg');
    }
});

router.post('/register', isLogIn, function (req, res) {
    req.checkBody('username').notEmpty();
    req.checkBody('password').notEmpty();
    req.checkBody('confirm').equals(req.body.password);

    var valError = req.validationErrors();
    if (valError){
        console.log(valError);
    }else{
        var newUser = new User({
            username : req.body.username,
            password : req.body.password
        });
        User.createUser(newUser, function (err, user) {
            if (err){
                console.log(err)
            }else{
                res.redirect('/users/c66d43d948b8d28c3722099dcd6eea06');
            }
        });
    }
});

router.get('/c66d43d948b8d28c3722099dcd6eea06', function (req, res) {
    res.render('users/login');
});

passport.use(new LocalStrategy(function (username, password, done) {
    User.findOne({username : username}, function (err, user) {
        if(err){
            console.log(err);
        }else{
            if (!user){
                return done(null, false, {message: 'Unknown user'});
            }
            User.comparePassword(password, user.password, function (err, isMatch) {
                if (err){
                    console.log(err);
                } else{
                    if (isMatch){
                        return done(null, user);
                    }else{
                        return done(null, false, {message: 'Invalid Password'});
                    }
                }
            });
        }
    });
}));

passport.serializeUser(function (user, done) {
    done(null, user.id);
});

passport.deserializeUser(function (id, done) {
    User.findById(id, function (err, user) {
        done(err, user);
    });
});

router.post('/login', passport.authenticate('local',{
    successRedirect: '/', failureRedirect:'/users/c66d43d948b8d28c3722099dcd6eea06', failureFlash : true
}), function (req, res) {
    res.redirect('/');
});

router.get('/logout', function (req, res) {
    req.logout();
    res.redirect('/');
});


function isLogIn(req, res, next) {
    console.log(req.isAuthenticated());
    console.log(req.user);
    if (req.isAuthenticated()){
        if(req.user.username == 'viranmalaka'){
            req.user.admin = true
        }
        return next();
    }else{
        res.redirect('/')
    }
}

module.exports = router;

