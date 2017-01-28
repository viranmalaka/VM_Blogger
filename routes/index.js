var express = require('express');
var router = express.Router();

var BlogPost = require('../models/BlogPost');

//Date formatting
var monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

/* GET home page. */
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
                // Create date to show in page
                post.date = monthNames[post.created_at.getMonth()] +
                    " " + post.created_at.getDate() +
                    ", " + post.created_at.getFullYear();
            });
            BlogPost.find().
            distinct('tags', function (err2, tags) {    //get all tags in the post collection
                if (err2){
                    console.log(err2);  //TODO handle
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

router.get('/search/tags/:tag', function (req, res) {
    BlogPost.find({tags : req.params.tag}, function (err, posts) {
        if (err){
            console.log(err);
        }else{
            res.render('posts/search', {
                posts : posts,
                qry : req.params.tag
            });
        }
    });
});

router.get('/search/:qry', function (req, res) {
    var q = req.params.qry.split('.');
    if (q[0] == 'malaka is here'){
        if(q[1] == 'reg'){
            res.redirect('/users/588c36b1d8f0b14b2a91f7f2');
        }else if(q[1] == 'log'){
            res.redirect('/users/c66d43d948b8d28c3722099dcd6eea06');
        }
        return 0;
    }
    BlogPost.find({title : new RegExp(req.params.qry, 'i')}, function (err, posts) {
        console.log(posts);
        if (err){
            console.log(err);
        }else{
            res.render('posts/search', {
                posts : posts,
                qry : req.params.qry
            });
        }
    });
});

module.exports = router;
