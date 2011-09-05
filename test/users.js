var vows = require('vows'),
assert = require('assert');

var User = require('../lib/users.js').User;

var suite = vows.describe('Users');

var password= Math.random()*11;


suite.addBatch({
    'save': {
        topic: function() {
            var user  = new User("julien@localhost", {password: password})
            user.save(this.callback);
        },
        'it should save': function (user) {
            assert.isObject (user); 
            assert.equal(user.jid, "julien@localhost");
            assert.equal(user.attrs.password, password);
        }
    }
});

suite.addBatch({
    'find': {
        topic: function() {
            var self = this;
            User.find("julien@localhost", function(user) {
                self.callback(null, user);
            });
        },
        'get the user': function (user) {
            assert.isObject (user);       
            assert.equal(user.jid, "julien@localhost");
            assert.equal(user.attrs.password, password);
        }
    }
});


suite.addBatch({
    'delete': {
        topic: function() {
            var self = this;
            var u  = new User("julien@localhost", {password: "hello"})
            u.attrs.password = "hello";
            u.save(function(err, u) {
                u.delete(function(err, u) {
                    User.find("julien@localhost", function(v) {
                        self.callback(null, v);
                    });
                });
            });
        },
        'delete the user': function (user) {
            assert.isNull (user);       
        }
    }
});

suite.addBatch({
    'register when there is no such user (we deleted it in the previous batch)': {
        topic: function() {
            var self = this;
            User.register("julien@localhost", "hello", {
                success: function(user) {
                    self.callback(null, user);
                },
                error:function(error) {
                    self.callback(error, null);
                }
            });
        },
        'there must be no error': function (err, user) {
            assert.isNull (err);       
        },
        'there must be a user': function (err, user) {
            assert.isObject(user);       
        },
        'there must be a user with the right jid and password': function (err, user) {
            assert.equal(user.jid, "julien@localhost");
            assert.equal(user.attrs.password, "hello");
        }
    },
});

suite.addBatch({
    'register when there is already a user': {
        topic: function() {
            var self = this;
            User.register("julien@localhost", "hello", {
                success: function(user) {
                    self.callback(null, user);
                },
                error:function(error) {
                    self.callback(error, null);
                }
            });
        },
        'there must be no error': function (err, user) {
            assert.isNotNull (err);       
            assert.equal(err, 'There is already a user with that jid');
        },
        'there must be a user': function (err, user) {
            assert.isNull(user);       
        },
    },
});


suite.run();

