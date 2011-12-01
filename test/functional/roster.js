/**
* This attempts to connect to the XMPP server and tests the roster features
**/
var sys = require('sys');
var xmpp = require('node-xmpp');
var _ = require('underscore');
var User = require('../../lib/users.js').User;

fixtures = [["bernard@localhost", "bErnArD"]]; // Fixtures 


describe('Connect client', function(){
    var cl = null;
    
    beforeEach(function(proceed){
        var ready = _.after(fixtures.length, function() {
            cl = new xmpp.Client({jid: "bernard@localhost", password: "bErnArD"});
            cl.on('online', function () {
                proceed();
            });
        });
        _.each(fixtures, function(fixture) {
            User.register(fixture[0], fixture[1], {
                force: true,
                success: ready,
                error: function(err) {
                    console.log("Couldn't add users.");
                    process.exit(1);
                }
            });
        });
    });
    
    it('should be able grab the roster', function(done){
        cl.on('stanza', function(stanza) {
            var query = stanza.getChild('query', "jabber:iq:roster");
            if(stanza.name === "iq" && query) {
                done();
            }
        });
        cl.send(new xmpp.Iq({type: 'get'}).c('query', {xmlns: 'jabber:iq:roster'}));
    });
    it('should allow for addition of new items');
    it('should allow for deletion of roster items');
    
});


