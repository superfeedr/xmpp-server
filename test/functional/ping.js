/**
* This attempts to connect to the XMPP server and tests the roster features
**/
var xmpp = require('node-xmpp');
var server  = require('../../lib/server.js');

var _ = require('underscore');
var User = require('../../lib/users.js').User;

fixtures = [["bernard@localhost", "bErnArD"]]; // Fixtures 


describe('Connect client', function(){
    var cl = null;
    var pingId = "pingId-1"
    
    before(function(proceed) {
        server.run({port: 5222, domain: 'localhost'}, function() {
            proceed();
        });
    });
    
    
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
    
    it('should be able to ping the server and get a pong', function(done){
        cl.on('stanza', function(stanza) {
            if(stanza.name === "iq" && stanza.id === pingId) {
                done();
            }
        });
        cl.send(new xmpp.Iq({type: 'get', id: pingId}).c('ping', {xmlns: 'urn:xmpp:ping'}));
    });
    
});


