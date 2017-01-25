var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('pages/home', { title: 'Malaka', header_image : '/img/home-bg.jpg' });
});

module.exports = router;
