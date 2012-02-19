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
    var versionConfig = {
        name: "Test Server",
        version: "0.0.0.1",
        os: "Mac OS X"
    }
    
    
    before(function(proceed) {
        server.run({port: 5222, domain: 'localhost', version: versionConfig}, function() {
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
    
    it('should be able discover server infos', function(done){
        cl.on('stanza', function(stanza) {
            var query = stanza.getChild('query', 'jabber:iq:version');
            if(stanza.name === "iq" && query) {
                var name = query.getChild('name', 'jabber:iq:version').getText();
                var version = query.getChild('version', 'jabber:iq:version').getText();
                var os = query.getChild('os', 'jabber:iq:version').getText();
                if(name === versionConfig.name && version === versionConfig.version && versionConfig.os === versionConfig.os) {
                    done();
                }
                else {
                    throw function() {};
                }
            }
        });
        cl.send(new xmpp.Iq({type: 'get'}).c('query', {xmlns: 'jabber:iq:version'}));
    });
    
});


