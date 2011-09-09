var xmpp = require('node-xmpp');
var winston = require('winston');

// http://xmpp.org/extensions/xep-0160.html
exports.name = "logger";


function Logger(client) {
    
    var self = this;
    
    this.format_log = function (message) {
        return client.identifier + " : " + message
    }
    
    client.identifier = new Date().getTime() + "-" + Math.floor(Math.random()*100000);
    
    client.on('stanza', function(stanza) {
        winston.debug(self.format_log(stanza.toString()));
    });
    
    client.on('session-started', function() {
        winston.info(self.format_log(stanza.toString()));
    });

    client.on('auth-success', function(jid) {
        winston.info(self.format_log("auth-success " + jid));
    });

    client.on('auth-failure', function(jid) {
        winston.info(self.format_log("auth-failure " + jid));
    });

    client.on('registration-success', function(jid) {
        winston.info(self.format_log("registration-success " + jid));
    });

    client.on('registration-failure', function(jid) {
        winston.info(self.format_log("registration-failure " + jid));
    });
}


exports.mod = Logger;

