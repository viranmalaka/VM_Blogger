var express = require('express');
var router = express.Router();
var multer = require('multer');
var uploadBg = multer({dest : './public/uploads/bg'});      // set Background file uploading dir
var uploadPost = multer({dest : './public/uploads/posts'}); // set inner post images file uploading dir

var BlogPosts = require('../models/BlogPost');

//Date formatting (copy from stack overflow)
Date.prototype.getFromFormat = function(format) {
    var yyyy = this.getFullYear().toString();
    format = format.replace(/yyyy/g, yyyy)
    var mm = (this.getMonth()+1).toString();
    format = format.replace(/mm/g, (mm[1]?mm:"0"+mm[0]));
    var dd  = this.getDate().toString();
    format = format.replace(/dd/g, (dd[1]?dd:"0"+dd[0]));
    var hh = this.getHours().toString();
    format = format.replace(/hh/g, (hh[1]?hh:"0"+hh[0]));
    var ii = this.getMinutes().toString();
    format = format.replace(/ii/g, (ii[1]?ii:"0"+ii[0]));
    var ss  = this.getSeconds().toString();
    format = format.replace(/ss/g, (ss[1]?ss:"0"+ss[0]));
    return format;
};

router.get('/index', function (req, res) {
    BlogPosts.paginate({
        publish : true                  // filter finish posts only
    }, {
        page : req.query.page,          //read the query '/index?page=3'
        limit : 3                       //set defalut limit
    }, function (err, result) {
        res.render('posts/index', {
            title: 'Welcome to VM Blogger',
            subtitle:"I'm Viran Malaka",
            header_image : '/img/allpost-bg.jpg',
            posts: result.docs,         //get paginated docs
            pageCount : result.total / 3 + 1 // determine how many pages
        });
    });
});

router.get('/create', function (req, res) {
    res.render('posts/create');
});

router.post("/create" ,
    uploadBg.single('bg-image'), // user multer upload image file
    function (req, res) {
        //validations
        req.checkBody('title', 'Title is required').notEmpty();
        req.checkBody('slug', "Slug is required").notEmpty();
        req.checkBody('body', 'Body is required').notEmpty();

        var valErr = req.validationErrors();
        if (valErr) {                                   // if validation fails return back
            res.render('posts/create', {
                errors : valErr,
                _title : req.body.title,
                _slug : req.body.slug,
                _body : req.body.body,
                _subtitle : req.body.subtitle,
                _tags : req.body.tags
            });
        }else{
            if(req.file == null){
                //define error messages
                e = [{
                    param:'bg-image',
                    msg: 'Background image is required',
                    value : ''
                }];
                res.render('posts/create', {
                    errors : e,
                    _title : req.body.title,
                    _slug : req.body.slug,
                    _body : req.body.body,
                    _subtitle : req.body.subtitle,
                    _tags : req.body.tags
                });
            }else{
                BlogPosts.find({
                    slug : req.body.slug            //find by slug
                }, function (err, slug_post) {
                    if (err){
                        console.log(err);           //TODO handle
                    }else{
                        if(slug_post.length == 0){
                            //create BlogPost
                            var bp = new BlogPosts();
                            bp.title = req.body.title;
                            bp.subtitle = req.body.subtitle;
                            bp.slug = req.body.slug;
                            bp.body = req.body.body;
                            bp.tags = req.body.tags.split(','); // tags is a string with commas
                            bp.created_at = new Date();         // set now

                            bp.backgroundImg = req.file.filename;
                            if(req.body.publish == undefined){      // check publish
                                bp.publish = false;
                                console.log("publish false" , req.body.publish);
                            }else{
                                bp.publish = true;
                                console.log("publish true" , req.body.publish);
                            }

                            bp.save(function (saveError, result) {
                                if(saveError){
                                    console.log(saveError);     // TODO handle
                                }else{
                                    res.redirect('/posts/' + result.slug);
                                }
                            });
                        }else{
                            e = [{param:'slug', msg: 'slug is already used', value : ''}];
                            res.render('posts/create', {errors : e,
                                _title : req.body.title,
                                _slug : req.body.slug,
                                _body : req.body.body,
                                _subtitle : req.body.subtitle,
                                _tags : req.body.tags
                            });
                        }
                    }
                })
            }
    }
});

router.get("/:slug", function (req, res) {
    BlogPosts.findOne({slug : req.params.slug}, function (err, post) {
        if (err){
            console.log(err);
        }else{
            console.log(post == null);
            if(post != null){
                post.comments.forEach(function (itm) {
                    itm.created_at = itm.created_at.getFromFormat("hh:ii - yyyy-mm-dd");
                });
                res.render('posts/view', {
                    header_image : "/uploads/bg/" + post.backgroundImg,
                    title : post.title,
                    subtitle: post.subtitle,
                    post_body : post.body,
                    comments : post.comments,
                    likeCount : post.likes, post_view : true,
                    created_at : post.created_at.getFromFormat("hh:ii - yyyy-mm-dd"),
                    tags : post.tags,
                    _id : post._id});
            }else{
                res.send("404");
            }
        }
    });
});

router.get('/edit/:slug', function (req, res) {
    BlogPosts.findOne({slug : req.params.slug}, function (err, post) {
        if (err){
            console.log(err);
        }else{
            res.render('posts/edit', {
                title : post.title,
                slug : post.slug,
                subtitle: post.subtitle,
                post_body : post.body,
                post_id : post._id,
                tags : post.tags.join(","),
                comments : post.comments
            });
        }
    });
});

router.post('/edit/:slug',uploadBg.single('bg-image'), function (req, res) {
    req.checkBody('title', 'Title is required').notEmpty();
    req.checkBody('slug', "Slug is required").notEmpty();
    req.checkBody('body', 'Body is required').notEmpty();

    var valErr = req.validationErrors();
    if (valErr) {
        res.render('posts/edit', {errors : valErr,
            title : req.body.title,
            slug : req.body.slug,
            body : req.body.body,
            subtitle : req.body.subtitle,
            tags : req.body.tags});
        console.log(valErr);
    }else{
        BlogPosts.findOne({slug : req.params.slug}, function (err, slug_post) {
            if (err){
                console.log(err);
            }else {
                BlogPosts.find({slug : req.body.slug}, function (e, newSlug) {
                    if(e){
                        console.log(e);
                    }else{
                        if (newSlug && (req.body.slug != req.params.slug)){
                            e = [{param:'slug', msg: 'slug is already used', value : ''}];
                            res.render('posts/create', {errors : e,
                                title : req.body.title,
                                slug : req.body.slug,
                                body : req.body.body,
                                subtitle : req.body.subtitle,
                                tags : req.body.tags});
                        }else{
                            slug_post.title = req.body.title;
                            slug_post.subtitle = req.body.subtitle;
                            slug_post.slug = req.body.slug;
                            slug_post.body = req.body.body;
                            slug_post.tags = req.body.tags.split(',');


                            slug_post.save(function (saveError, result) {
                                if(saveError){
                                    console.log(saveError);
                                }else{
                                    console.log(result);
                                    console.log('DONE');
                                    res.redirect('/posts/' + result.slug);
                                }
                            });
                        }
                    }
                });
            }
        });

    }
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
            created_at : new Date(),
            show : true
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

router.post("/submitLike", function (req, res) {
    if(req.body.post_id){
        BlogPosts.findOne({_id:req.body.post_id}, function (err, p) {
            if (!err){
                if(req.body.increase == 'true'){
                    p.likes ++;
                }else{
                    p.likes --;
                }
                p.save(function (e, savedPost) {
                    res.send({count: savedPost.likes});
                });
            }
        });
    }
});

module.exports = router;