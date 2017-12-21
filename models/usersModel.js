// mongoose schema for user
var mongoose = require('mongoose');

var user = mongoose.model('User',{
    name: {type : String, required:true},
    Lname:{type : String, required:true},
    password:{type : String, required:true},
    email:{type : String, required:true},
    mobile:{type : String, required:false}
});
module.exports = user;