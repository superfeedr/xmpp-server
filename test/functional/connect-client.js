/**
* This attempts to connect to the XMPP server.
**/
var xmpp = require('node-xmpp');
var server  = require('../../lib/server.js');

var _ = require('underscore');
var User = require('../../lib/users.js').User;

fixtures = [["bernard@bernard.local", "bErnArD"]]; // Fixtures 

// Mocking SRV reolution!
var dns  = require('dns');
dns.resolveSrv = function(domain, callback) {
    callback(null, [{name: '0.0.0.0', port: 5222, priority: 5, weight:10}]);
}

describe('Connect client', function(){
    
    before(function(proceed) {
        server.run({port: 5222, domain: 'bernard.local'}, function() {
            proceed();
        });
    });
    
    beforeEach(function(proceed){
        var ready = _.after(fixtures.length, function() {
            proceed();
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
    
    it('should connect just fine when the password is correct', function(done){
        var cl = new xmpp.Client({jid: "bernard@bernard.local", password: "bErnArD"});
        cl.on('online', function () {
            done();
        });
    });
    
    it('should trigger an error when the password is not correct', function(done){
        var cl = new xmpp.Client({jid: "bernard@bernard.local", password: "bErnArD0"});
        cl.on('online', function () {
            throw function() {};
        });
        cl.on('error', function(err) {
            if(err === "XMPP authentication failure") {
                done();
            }
        });
    });
    
});


