/**
* This connnects 2 clients to the server and makes sure they converse adequately!
**/

var xmpp = require('node-xmpp');
var server  = require('../../lib/server.js');

var _ = require('underscore');
var User = require('../../lib/users.js').User;
fixtures = [["romeo@localhost", "romeo"], ["juliet@localhost", "juliet"]]; // Fixtures 


describe('When a user is offline', function(){
    var romeo, juliet = null;

    var romeoSays = "O blessed, blessed night! I am afeard. \
       Being in night, all this is but a dream, \
       Too flattering-sweet to be substantial.";
    
    before(function(proceed) {
        server.run({port: 5222, domain: 'localhost'}, function() {
            proceed();
        });
    });
    
    beforeEach(function(proceed){
        var ready = _.after(fixtures.length, function() {
            romeo = new xmpp.Client({
                jid: "romeo@localhost",
                password: "romeo"
            });
            romeo.on('online', function () {
                romeo.send(new xmpp.Element('presence', {}).c('show').t('chat').up().c('status').t('On the balcony'));
                romeo.send(new xmpp.Element('message', {to: "juliet@localhost"}).c('body').t(romeoSays)); // juliet is not online!
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

    it('should send offline messages to Juliet', function(done){
        juliet = new xmpp.Client({
            jid: "juliet@localhost",
            password: "juliet"
        });
        
        juliet.on('stanza', function(stanza) {
            if (stanza.is('message') && new xmpp.JID(stanza.attrs.from).bare().toString() == "romeo@localhost" && stanza.getChild('body').getText() == romeoSays) {
                done();
            }
            else {
                throw function() {}; // Bernard didn't get Bianca's Hello.
            }
        });
    });

});


