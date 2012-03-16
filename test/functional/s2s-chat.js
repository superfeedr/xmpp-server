/**
* This connnects 2 clients to the server and makes sure they converse adequately!
**/
var xmpp    = require('node-xmpp');
var server  = require('../../lib/server.js');
var _       = require('underscore');

var User = require('../../lib/users.js').User;
fixtures = [["bernard@bernard.local", "bErnArD"], ["bianca@bianca.local", "B1anCA"]]; // Fixtures 


var dns  = require('dns');
dns.resolveSrv = function(domain, callback) {
    if(domain === "_xmpp-client._tcp.bernard.local") {
        callback(null, [{name: '0.0.0.0', port: 52220, priority: 5, weight:10}]);
    }
    else if(domain === "_xmpp-client._tcp.bianca.local") {
        callback(null, [{name: '0.0.0.0', port: 52221, priority: 5, weight:10}]);
    }
    else if(domain === "_xmpp-server._tcp.bernard.local") {
        callback(null, [{name: '0.0.0.0', port: 52690, priority: 5, weight:10}]);
    }
    else if(domain === "_xmpp-server._tcp.bianca.local") {
        callback(null, [{name: '0.0.0.0', port: 52691, priority: 5, weight:10}]);
    }
}


describe('A small chat accross 2 servers', function(){
    var bernard, bianca = null;

    before(function(proceed) {
        server.run({port: 52220, domain: 'bernard.local',  s2sPort: 52690}, function() {
            server.run({port: 52221, domain: 'bianca.local', s2sPort: 52691}, function() {
                proceed();
            });
        });
    });

    beforeEach(function(proceed){
        bernard, bianca = null;
        var ready = _.after(fixtures.length, function() {
            bernard = new xmpp.Client({
                jid: "bernard@bernard.local",
                password: "bErnArD",
            });
            bianca = new xmpp.Client({
                jid: "bianca@bianca.local",
                password: "B1anCA"
            });

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
            if (stanza.is('message') && new xmpp.JID(stanza.attrs.from).bare().toString() == "bianca@bianca.local" && stanza.getChild('body').getText() == biancaSays) {
                done();
            }
            else {
                throw function() {}; // Bernard didn't get Bianca's Hello.
            }
        });
        bianca.send(new xmpp.Element('message', {to: "bernard@bernard.local"}).c('body').t(biancaSays));
    });

    it('bianca should get bernard\'s messages', function(done){
        var bernardSays = 'Hi Bianca!';
        bianca.on('stanza', function(stanza) {
            if (stanza.is('message') && new xmpp.JID(stanza.attrs.from).bare().toString() == "bernard@bernard.local" && stanza.getChild('body').getText() == bernardSays) {
                done();
            }
            else {
                throw function() {}; // Bernard didn't get Bianca's Hello.
            }
        });
        bernard.send(new xmpp.Element('message', {to: "bianca@bianca.local"}).c('body').t(bernardSays));
    });
    
    // 
    // it('bianca and bernard should chat just fine', function(done){
    //       var bernardSays = 'Ciao Bianca!';
    //       var responses = _.after(10, function() {
    //           // done();
    //       });
    //       bianca.on('stanza', function(stanza) {
    //           if (stanza.is('message') && new xmpp.JID(stanza.attrs.from).bare().toString() == "bernard@bernard.local" ) {
    //               bianca.send(new xmpp.Element('message', {to: "bernard@bernard.local"}).c('body').t(bernardSays));
    //               responses();
    //           }
    //       });
    //       
    //       bernard.on('stanza', function(stanza) {
    //           if (stanza.is('message') && new xmpp.JID(stanza.attrs.from).bare().toString() == "bianca@bianca.local") {
    //               bernard.send(new xmpp.Element('message', {to: "bianca@bianca.local"}).c('body').t(bernardSays));
    //               responses();
    //           }
    //       });
    //       
    //       bernard.send(new xmpp.Element('message', {to: "bianca@bianca.local"}).c('body').t(bernardSays));
    //   });
    // 

});


