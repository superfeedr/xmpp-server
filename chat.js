/**
* This connnects 2 clients to the server and makes sure they converse adequately!
**/
var xmpp    = require('node-xmpp');
var server  = require('../../lib/server.js');
var _       = require('underscore');

var User = require('../../lib/users.js').User;
fixtures = [["bernard@localhost", "bErnArD"], ["bianca@localhost", "B1anCA"]]; // Fixtures 

describe('A small chat', function(){
    var bernard, bianca = null;

    before(function(proceed) {
        server.run({port: 5222, domain: 'localhost'}, function() {
            proceed();
        });
    });

    beforeEach(function(proceed){
        var ready = _.after(fixtures.length, function() {
            bernard = new xmpp.Client({
                jid: "bernard@localhost",
                password: "bErnArD"
            });
            bianca = new xmpp.Client({
                jid: "bianca@localhost",
                password: "B1anCA"
            });

            // When Bernard is online. Let's get him to reply to Bianca only if she says 'Hello Bernard!'. If she doesn't, then, we fail.
            bernard.on('online', function () {
                bernard.send(new xmpp.Element('presence', {}).c('show').t('chat').up().c('status').t('Bernard is here to help!'));
                online();
            });

            bianca.on('online', function () {
                bianca.send(new xmpp.Element('presence', {}).c('show').t('chat').up().c('status').t('Ready to help!'));
                online();
            });
            var online = _.after(2, function() {
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

    it('bernard should get bianca\'s messages', function(done){
        var biancaSays = 'Hello Bernard!';
        bernard.on('stanza', function(stanza) {
            if (stanza.is('message') && new xmpp.JID(stanza.attrs.from).bare().toString() == "bianca@localhost" && stanza.getChild('body').getText() == biancaSays) {
                done();
            }
            else {
                throw function() {}; // Bernard didn't get Bianca's Hello.
            }
        });
        bianca.send(new xmpp.Element('message', {to: "bernard@localhost"}).c('body').t(biancaSays));
    });

    it('bianca should get bernard\'s messages', function(done){
        var bernardSays = 'Hi Bianca!';
        bianca.on('stanza', function(stanza) {
            if (stanza.is('message') && new xmpp.JID(stanza.attrs.from).bare().toString() == "bernard@localhost" && stanza.getChild('body').getText() == bernardSays) {
                done();
            }
            else {
                throw function() {}; // Bernard didn't get Bianca's Hello.
            }
        });
        bernard.send(new xmpp.Element('message', {to: "bianca@localhost"}).c('body').t(bernardSays));
    });

});


