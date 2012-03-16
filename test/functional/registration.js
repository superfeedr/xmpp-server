/**
* This attempts to connect to the XMPP server.
**/
var xmpp = require('node-xmpp');
var server  = require('../../lib/server.js');

var _ = require('underscore');
var User = require('../../lib/users.js').User;


describe('Register a new jid', function(){
    
    before(function(proceed) {
        server.run({port: 5222, domain: 'localhost'}, function() {
            proceed();
        });
    });
    
    beforeEach(function(proceed){
        proceed();
    });
    
    it('should allow for user registration for a new jid', function(done){
        // Can't be implemented as it seems that node-xmpp doesn't support registration for now :(
    });

    it('should prevent duplication if that jid exists', function(done){
        // Can't be implemented as it seems that node-xmpp doesn't support registration for now :(
    });
    
});


