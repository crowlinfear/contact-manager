// mongoose schema for groups
var mongoose = require('mongoose');

var groups = mongoose.model('Groups',{
   name : {type:String, required:true},
   owner_id : {type:String, required:true}
});
module.exports = groups;