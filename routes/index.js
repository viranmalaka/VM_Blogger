var express = require('express');
var router = express.Router();

var BlogPost = require('../models/BlogPost');

//Date formatting
var monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

/* GET home page. */
router.get('/', function(req, res, next) {
    BlogPost.find().sort({created_at : 1}).limit(5).exec(function (err1, output) {
        if (err1){
            console.log(err1);
        }else{
            output.forEach(function (post) {
                post.date = monthNames[post.created_at.getMonth()] + " " + post.created_at.getDate() + ", " + post.created_at.getFullYear();
            });
            BlogPost.find().distinct('tags', function (err2, tags) {
                if (err2){
                    console.log(err2);
                }else{
                    BlogPost.find().sort({ likes: -1}).limit(8).select('title slug').exec(function (err3, top) {
                        if(err3){
                            console.log(err3);
                        }else{
                            res.render('pages/home', { title: 'Welcome to VM Blogger', subtitle:"I'm Viran Malaka", header_image : '/img/home-bg.jpg', posts: output, tags: tags, top : top});
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
