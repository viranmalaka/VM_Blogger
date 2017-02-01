var mongoose = require('mongoose');
var bycrypt = require('bcryptjs');
var Schema = mongoose.Schema;

var schema = new Schema({
    username : {type : String, required : true},
    password : {type : String, required : true}
});

module.exports = mongoose.model('User', schema);

module.exports.createUser = function (newUser, cb) {
    bycrypt.genSalt(10, function (err, salt) {
        bycrypt.hash(newUser.password, salt, function (err, hash) {
            newUser.password = hash;
            newUser.save(cb);
        })
    });
};

module.exports.comparePassword = function (candidatePassword, hash, cb) {
    bycrypt.compare(candidatePassword, hash, function (err, isMatch) {
        if(err){
            console.log(err);
        }else{
            cb(null, isMatch);
        }
    });
};