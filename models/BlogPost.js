var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schema = new Schema({
    title : {type: String, required: true},
    subtitle : {type : String, default : ""},
    body : {type: String, required: true},
    likes : {type: Number, default : 0},
    slug : {type: String, required: true, unique : true},
    tags : {type : [String]},
    user : {type : Schema.ObjectId, ref : 'User'},
    comments :{type : [{}]},
    created_at : {type : Date, required : true},
    backgroundImg : {type : String, required: true}
});

module.exports = mongoose.model('BlogPost', schema);