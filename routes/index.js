var express = require('express');
var router = express.Router();

var BlogPost = require('../models/BlogPost');
var Contact = require('../models/Contact');

//Date formatting
var monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];


//home page
router.get('/', function(req, res, next) {
    BlogPost.find().sort({
        created_at : 1                  //get recent posts
    }).
    select('title subtitle created_at tags slug').
    limit(5).                           // only 5
    exec(function (err1, output) {
        if (err1){
            console.log(err1);          //TODO handle
        }else{
            output.forEach(function (post) {
                // Create date format to show in page
                post.date = monthNames[post.created_at.getMonth()] +
                    " " + post.created_at.getDate() +
                    ", " + post.created_at.getFullYear();
            });

            //finding the blog posts
            BlogPost.find().
            distinct('tags', function (err2, tags) {    //get all tags in the post collection
                if (err2){
                    console.log(err2);                  //TODO handle
                }else{
                    BlogPost.find().sort({
                        likes: -1                       // get top rated post. most likes
                    }).
                    limit(8).                           // get only 8
                    select('title slug').               // select only title and slug
                    exec(function (err3, top) {
                        if(err3){
                            console.log(err3);          //TODO handle
                        }else{
                            res.render('pages/home', {              // return all data
                                headerTitle : "VM Blogger",
                                title: 'Welcome to VM Blogger',
                                subtitle:"I'm Viran Malaka",
                                header_image : '/img/home-bg.jpg',
                                posts: output,
                                tags: tags,
                                top : top
                            });
                        }
                    });
                }
            });
        }
    });
});

//search by tag name
router.get('/search/tags/:tag', function (req, res) {
    BlogPost.find({
        tags : req.params.tag,                          //search by tag name
        publish : true                                  // visible only
    }).
    select('title subtitle slug tags created_at').      //select
    exec(function (err, posts) {
        if (err){
            console.log(err);                           //TODO handle
        }else{
            res.render('posts/search', {                //send
                headerTitle : 'VM Blogger Search',
                posts : posts,
                qry : req.params.tag
            });
        }
    });
});

//search by titles
router.get('/search/:qry', function (req, res) {

    //hidden routers for admin
    var q = req.params.qry.split('.');
    if (q[0] == 'malaka is here'){
        if(q[1] == 'reg'){
            res.redirect('/users/588c36b1d8f0b14b2a91f7f2');
        }else if(q[1] == 'log'){
            res.redirect('/users/c66d43d948b8d28c3722099dcd6eea06');
        }
        return 0;
    }


    BlogPost.find({
        title : new RegExp(req.params.qry, 'i'),            //finding regex
        publish : true                                      //visible only
    }, function (err, posts) {
        if (err){
            console.log(err);                               // TODO handle
        }else{
            res.render('posts/search', {                    //send
                headerTitle : "VM Blogger Search",
                posts : posts,
                qry : req.params.qry
            });
        }
    });
});

//get contact page
router.get('/contact', function (req, res) {
    res.render('pages/contact',{                            //send response
        headerTitle : 'VM Blogger - Contact',
        title: "Contact Me",
        subtitle:"Have questions? I have answers (maybe).",
        header_image : '/img/contact-bg.jpg'
    });
});

//post contact form by ajax
router.post('/contact', function (req, res) {

    // Define Express Validation
    req.checkBody('name', 'Name is required').notEmpty();
    req.checkBody('email', 'Email Address is required').notEmpty();
    req.checkBody('telephone', 'Telephone Number is required').notEmpty();
    req.checkBody('message', 'Message is required').notEmpty();

    var valErrors = req.validationErrors();
    if(valErrors){                              // if there is an validation error
        console.log(valErrors);                 // TODO handle
    }else{

        //create new Contact Object
        var c = new Contact();
        c.name = req.body.name;
        c.email = req.body.email;
        c.telephone = req.body.telephone;
        c.message = req.body.message;

        c.save(function (err, result) {
            if (err){
                console.log(err);               // TODO handle
            }else{
                res.end();                      // save successfully
            }
        })
    }

});


// get all contact for admin
router.get('/contact/all',
    isLogIn,                                                    // check auth
    function (req, res) {
    if (req.user.admin){                                        // check admin
        Contact.find(function (err, result) {
            res.render('pages/allcontact',{contacts : result}); // send response
        });
    }else{
        res.redirect("/");                                      // error redirect
    }
});


//function to check the authentication.
function isLogIn(req, res, next) {
    if (req.isAuthenticated()){
        if(req.user.username == 'viranmalaka'){
            req.user.admin = true
        }
        return next();
    }else{
        res.redirect('/')
    }
}

// //define 404 router
// router.get('*', function (req, res) {
//     res.render('pages/404')
// });


router.get('/404', function (req, res) {
    res.render('pages/404')
});
module.exports = router;
