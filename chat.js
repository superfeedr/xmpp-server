/**
* This connnects 2 clients to the server and makes sure they converse adequately!
**/

var sys  = require('sys');
var xmpp = require('node-xmpp');
var argv = process.argv;
var _ = require('underscore');
var User = require('../../lib/users.js').User;
fixtures = [["bernard@localhost", "bErnArD"], ["bianca@localhost", "B1anCA"]]; // Fixtures 


var done = _.after(fixtures.length, function() {
    // Connects Bernard
    var bernard = new xmpp.Client({
        jid: "bernard@localhost",
        password: "bErnArD"
    });

    // Connects Bianca
    var bianca = new xmpp.Client({
        jid: "bianca@localhost",
        password: "B1anCA"
    });
    
    var online = _.after(2, function() {
        // When they're both online
        bernard.on('stanza', function(stanza) {
            if (stanza.is('message') && stanza.attrs.type !== 'error' && stanza.getChild('body').getText() == "Hello Bernard!") {
                console.log("Bianca said hello!");
                bianca.send(new xmpp.Element('message', {to: stanza.attrs.from}).c('body').t('Hi Bianca!'));
            }
            else {
                console.log("Bianca didn't say hello!");
                process.exit(1);
            }
        });
        
        bianca.on('stanza', function(stanza) {
            if (stanza.is('message') && stanza.attrs.type !== 'error' && stanza.getChild('body').getText() == "Hi Bianca!") {
                console.log("Bernard said hi.");
                process.exit(0);
            }
            else {
                console.log("Bernard didn't say hi.");
                process.exit(1);
            }
        });
        
        bianca.send(new xmpp.Element('message', {to: "bernard@localhost"}).c('body').t('Hello Bernard!'));
        
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
});
/*
Prep : user registration
*/
_.each(fixtures, function(fixture) {
    User.register(fixture[0], fixture[1], {
        force: true,
        success: done,
        error: function(err) {
            console.log("Couldn't add users.");
            process.exit(1);
        }
    })
});

