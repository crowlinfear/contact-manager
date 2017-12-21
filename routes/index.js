var express = require('express');
var router = express.Router();
var hash = require('password-hash')
var user = require('../models/usersModel');
var groups = require('../models/groupsModel');
var contacts = require('../models/contactsModel');
var session = require('express-session');
var fs      =require('fs')
var grpid;

var sess;
/* GET home page. */
router.get('/', function(req, res, next) {
    sess = req.session;
    if (sess.email) {
        res.redirect('/home');
    } else {
        res.render('index', {
            title: 'Express'
        });
    }
});
//Adding new user
router.post('/new', function(req, res) {
    var u1 = new user({
        name: req.body.name,
        Lname: req.body.Lname,
        email: req.body.email,
        mobile: req.body.mobile,
        password: hash.generate(req.body.password)
    });
    u1.save(function(err) {
        if (err) {
            console.log(err.stack)
        };
        console.log('saving done ...')
        console.log(u1)

    })
    res.redirect('/')
});

//displaying home page
router.get('/home', function(req, res) {
    user.findOne({
        "email": sess.email
    }, function(err, doc) {
        if (err) throw err;
        var name = doc.name;
        contacts.find({
            'owner_id': sess.email
        }, function(err, result) {
            if (err) throw err;
            res.render('home', {
                name: name,
                data: result
            });
        })

    });
});
//Authentication
router.post('/home', function(req, res) {
    var email = req.body.email;
    var password = req.body.password;
    user.findOne({
        'email': email
    }, function(err, doc) {
        if (err) throw err;
        if (doc === null) {
            res.redirect('/')
        } else {
            console.log(doc.password)
            if (hash.verify(password, doc.password)) {
                console.log('AUTHENTICATED')
                sess = req.session;
                sess.email = email;
                res.redirect('/home')
            } else {
                console.log('NOT ALLOWED')
                res.redirect('/')
            }

        }
    })

})
//Adding new contact
router.post('/addcontact', function(req, res) {
    var c1 = new contacts({
        name: req.body.name,
        Lname: req.body.Lname,
        email: req.body.email,
        mobile: req.body.mobile,
        owner_id: sess.email
    })
    c1.save(function(err) {
        if (err) throw err;
        res.redirect('/home')

    })

})
// delete an existing contact
router.post('/deletecontact', function(req, res) {
    var id = req.body.id;
    contacts.findByIdAndRemove(id, function(err, doc) {
        if (err) throw err;
        console.log('contact has been removed')
        res.redirect('/home')
    })
})
// getting password page
router.get('/password', function(req, res) {
    if (sess.email) {
        res.render('password')
    } else {
        res.redirect('/')
    }
})
// update password
router.post('/password', function(req, res) {
    var newpass = hash.generate(req.body.password);
    var usr = sess.email;
    user.update({
        email: usr
    }, {
        password: newpass
    }, function(err, done) {
        if (err) throw err
        console.log('password changed')
        res.redirect('/home')
    })
})
// disconnect
router.get('/logout', function(req, res) {
    req.session.destroy(function(err) {
        if (err) throw err;
        sess = '';
        res.redirect('/');
    })
})
// display groups
router.get('/groups', function(req, res) {
    groups.find({
        owner_id: sess.email
    }, function(err, docs) {
        if (err) throw err;
        res.render('groups', {
            groups: docs
        });
    })

});
// Creating new group
router.post('/addgroup', function(req, res) {
    var g = new groups({
        name: req.body.name,
        owner_id: sess.email
    })
    g.save(function(err) {
        if (err) throw err;
        res.redirect('/groups')
    })

})
// Manage a certain group
router.get('/managegroup/:id?', function(req, res) {

    if (grpid == undefined || grpid != req.query.id && req.query.id != undefined) {
        grpid = req.query.id;
    }
    console.log(grpid)
    var nonsub = [];
    groups.findById(grpid, function(err, doc) {
        if (err) throw err;

        console.log(doc.name)
        contacts.find({
            owner_id: sess.email,
            in_group: doc.name
        }, function(err, docs) {
            if (err) throw err;

            console.log(docs)
            contacts.find({
                owner_id: sess.email
            }, function(err, d) {
                if (err) throw err;
                d.forEach(function(e) {
                    if (e.in_group.indexOf(doc.name) > -1) {
                        console.log('already in group');
                    } else {
                        nonsub.push(e);
                    }
                })
                nonsub;
                console.log(nonsub)
                res.render('group', {
                    title: doc.name,
                    subs: docs,
                    contacts: nonsub
                });
            })
        })
    })
})
// Adding a contact to group
router.post('/addcontactgroup', function(req, res) {
    var id = req.body.id;
    var gr = req.body.group
    contacts.findByIdAndUpdate(id, {
        $push: {
            in_group: gr
        }
    }, function(err) {
        if (err) throw err;
        groups.find({
            name: gr
        }, function(err, doc) {
            if (err) throw err;


            grpid = doc[0]._id;
            res.redirect('/managegroup/:' + grpid + '?');
        })
    })
})
// delete contact from group
router.post('/deletefromgroup', function(req, res) {
    var id = req.body.id;
    var gr = req.body.group
    contacts.findByIdAndUpdate(id, {
        $pull: {
            in_group: {
                $in: [gr]
            }
        }
    }, function(err) {
        if (err) throw err;
        groups.find({
            name: gr
        }, function(err, doc) {
            if (err) throw err;


            grpid = doc[0]._id;
            res.redirect('/managegroup/:' + grpid + '?');
        })
    })
})

// delete a group
router.post('/deletegroup', function(req, res) {
    var id = req.body.id
    groups.findById(id, function(err, doc) {
        if (err) throw err;
        console.log(doc.name);
        contacts.update({
            owner_id: sess.email
        }, {
            $pullAll: {
                in_group: [doc.name]
            }
        }, function(err) {
            if (err) throw err;
            groups.findByIdAndRemove(id, function(err) {
                if (err) throw err;
                res.redirect('/groups');
            })
        })
    })
})

// edit contact information
router.post('/editcontact', function(req, res) {
    var id = req.body.id;
    var nc = {
        name: req.body.name,
        Lname: req.body.Lname,
        mobile: req.body.mobile,
        email: req.body.email,
        owner_id: sess.email
    }
    contacts.findByIdAndUpdate(id, nc, function(err) {
        if (err) throw err;
        console.log('contact has been updated');
        res.redirect('/home')
    })
    
});

// exporting contacts to json file
router.get('/export', function(req, res) {
    var email = sess.email;
    contacts.find({
        owner_id: email
    },{_id:0,owner_id:0,__v: 0,in_group:0}, function(err, docs) {
        if (err) throw err;
        console.log(docs);
        var fp='./public/exported/contacts.json'
        fs.writeFile(fp, docs, function(err,response){
          if(err) throw err;
          
          console.log('saveed')
          res.download(fp,function(err){
            if(err) throw err;
            fs.unlink(fp)
            
          });
        })
        
    })
})

module.exports = router;