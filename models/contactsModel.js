// mongoose schema for contacts

var mongoose = require('mongoose');

var contacts = mongoose.model('Contacts',{
    name: {type : String, required:true},
    Lname:{type : String, required:true},
    email:{type : String, required:true},
    mobile:{type : String, required:true},
    owner_id:{type: String, required:true},
    in_group : [String]
});
module.exports = contacts;