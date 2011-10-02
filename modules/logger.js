var xmpp = require('node-xmpp');
var logger = require('winston');

// http://xmpp.org/extensions/xep-0160.html
exports.name = "logger";

function format_log(client, message) {
    return client.streamId + " : " + message
}

function Logger(client) {
    client.logger = logger;

    client.on('inStanza', function(stanza) {
        logger.debug(format_log(client, ">> " + stanza.toString()));
    });

    client.on('outStanza', function(stanza) {
        logger.debug(format_log(client, "<< " + stanza.toString()));
    });

    client.on('session-started', function() {
        logger.info(format_log(client, stanza.toString()));
    });

    client.on('auth-success', function(jid) {
        logger.info(format_log(client, "auth-success " + jid));
    });

    client.on('auth-failure', function(jid) {
        logger.info(format_log(client, "auth-failure " + jid));
    });

    client.on('registration-success', function(jid) {
        logger.info(format_log(client, "registration-success " + jid));
    });

    client.on('registration-failure', function(jid) {
        logger.info(format_log(client, "registration-failure " + jid));
    });
}

exports.mod = Logger;
exports.configure = function(c2s, s2s) {
}
