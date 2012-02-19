var vows = require('vows'),
assert = require('assert');

var Message = require('../lib/message.js').Message;

var suite = vows.describe('Messages');

suite.addBatch({
    'save': {
        topic: function() {
            var self = this;
            var message  = new Message("julien@localhost", "<message />")
            message.save(function(message) {
                self.callback(null, message)
            });
        },
        'it should save': function (error, message) {
            assert.isObject (message); 
            assert.equal(message.jid, "julien@localhost");
            assert.equal(message.stanza, "<message />");
        }
    }
});

suite.addBatch({
    'for': {
        topic: function() {
            var self = this;
            Message.nextFor("julien@localhost", function(message) {
                self.callback(null, message);
            });
        },
        'have the right content': function (message) {
            assert.isObject (message);       
            assert.equal(message.jid, "julien@localhost");
            assert.equal(message.stanza, "<message />");
        }
    }
});


suite.addBatch({
    'for': {
        topic: function() {
            var messages = [];
            var self = this;
            var m = new Message("julien@localhost", "<message from='sender@localhost' to='julien@localhost' id='0' />");
            m.save(function(err, m) {
                var n = new Message("julien@localhost", "<message from='sender@localhost' to='julien@localhost' id='1' />");
                n.save(function(err, n) {
                    var o = new Message("julien@localhost", "<message from='sender@localhost' to='julien@localhost' id='2' />");
                    o.save(function(err, o) {
                        Message.for("julien@localhost", function(message) {
                            messages.push(message);
                            if(messages.length == 3) {
                                self.callback(null, messages);
                            }
                        })
                    });
                });
            });
        },
        'delete the user': function (messages) {
            for(var i in messages) {
                assert.isObject (messages[i]); 
                assert.equal(messages[i].jid, "julien@localhost");
                assert.equal(messages[i].stanza, "<message from='sender@localhost' to='julien@localhost' id='" + i + "' />");
            }
        }
    }
});


suite.run();

