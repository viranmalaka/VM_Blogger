var express = require('express');
var router = express.Router();
var multer = require('multer');
var uploadBg = multer({dest : './public/uploads/bg'});
var uploadPost = multer({dest : './public/uploads/posts'});

var BlogPosts = require('../models/BlogPost');

router.get('/create', function (req, res) {
    res.render('posts/create');
});

router.post("/create" , uploadBg.single('bg-image'), function (req, res) {
    req.checkBody('title', 'Title is required').notEmpty();
    req.checkBody('slug', "Slug is required").notEmpty();
    req.checkBody('body', 'Body is required').notEmpty();

    var valErr = req.validationErrors();
    if (valErr) {
        res.render('posts/create', {errors : valErr,
                                    _title : req.body.title,
                                    _slug : req.body.slug,
                                    _body : req.body.body,
                                    _subtitle : req.body.subtitle});
        console.log(valErr);
    }else{
        if(req.file == null){
            e = [{param:'bg-image', msg: 'Background image is required', value : ''}];
            res.render('posts/create', {errors : e,
                _title : req.body.title,
                _slug : req.body.slug,
                _body : req.body.body,
                _subtitle : req.body.subtitle});
        }else{
            BlogPosts.find({slug : req.body.slug}, function (err, slug_post) {
                if (err){
                    console.log(err);
                }else{
                    if(slug_post){
                        //create BlogPost
                        var bp = new BlogPosts();
                        bp.title = req.body.title;
                        bp.subtitle = req.body.subtitle;
                        bp.slug = req.body.slug;
                        bp.body = req.body.body;
                        bp.tags = req.body.tags;
                        bp.created_at = new Date();

                        bp.backgroundImg = req.file.filename;

                        bp.save(function (saveError, result) {
                            if(saveError){
                                console.log(saveError);
                            }else{
                                console.log(result);
                                console.log('DONE');
                                res.redirect('/posts/' + result.slug);
                            }
                        });
                    }else{
                        e = [{param:'slug', msg: 'slug is already used', value : ''}];
                        res.render('posts/create', {errors : e,
                            _title : req.body.title,
                            _slug : req.body.slug,
                            _body : req.body.body,
                            _subtitle : req.body.subtitle});
                    }
                }
            })
        }
    }
});

router.get("/:slug", function (req, res) {
    BlogPosts.findOne({slug : req.params.slug}).exec(function (err, post) {
        if (err){
            console.log(err);
        }else{
            res.render('posts/view', {
                header_image : "/uploads/bg/" + post.backgroundImg,
                title : post.title,
                subtitle: post.subtitle,
                post_body : post.body,
                comments : post.comments,
                _id : post._id});
        }
    });
});

router.get('/:slug/edit', function (req, res) {
    BlogPosts.findOne({slug : req.params.slug}, function (err, post) {
        if (err){
            console.log(err);
        }else{
            res.render('posts/edit', {
                header_image : "/uploads/bg/" + post.backgroundImg,
                title : post.title,
                subtitle: post.subtitle,
                post_body : post.body,
                post_id : post._id
            });
        }
    });
});


//Ajax Routes
router.post('/imgupload', uploadPost.single('image'), function (req, res) {
    console.log(req.file);
    if (req.file){
        res.send("<script>top.$('.mce-btn.mce-open').parent().find('.mce-textbox').val('/uploads/posts/" + req.file.filename + "').closest('.mce-window').find('.mce-primary').click();</script>" )
    }
});

router.post('/addComment', function (req, res) {
    req.checkBody('name', "Name is required").notEmpty();
    req.checkBody('email', "Email is required").notEmpty();
    req.checkBody('comment', "Comment is empty").notEmpty();
    req.checkBody('post_id', "ID").notEmpty();

    var valErr = req.validationErrors();
    if (valErr){
        res.send('Error');
    }else{
        var com = {
            name : req.body.name,
            email : req.body.email,
            body : req.body.comment,
            created_at : new Date()
        };
        BlogPosts.findOne({_id : req.body.post_id}, function (err, post) {
            post.comments.push(com);
            post.save(function (e, savadPost) {
                console.log("post is updated");
            });
            res.send(com);
        });
    }
});
module.exports = router;