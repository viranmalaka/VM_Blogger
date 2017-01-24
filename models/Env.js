var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schema = new Schema({
    key : {type: String, required: true},
    value : {type: String, required: true}
});

model.exports = mongoose.model('Env', schema);