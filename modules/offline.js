var xmpp = require('node-xmpp');

// http://xmpp.org/extensions/xep-0160.html
exports.name = "mod_offline";

exports.store_offline_message = undefined; // By default we won't store. If you do, though, you want to add add a delay element to the stanza!

exports.messages_for_jid = function(jid, callback) {
    // callback(); // The callback needs to be called for each message
}

function RecipientOffline(client) {
    
    // User just connected. We may retrieve each offline message and send it.
    client.on('session-started', function() {
        exports.messages_for_jid(client.jid, function(stanza) {
            client.send(stanza);
        });
    });
    
    // When this client tried to send a message to an offline client.
    client.on('recipient_offline', function(stanza) {
        if(!exports.store_offline_message) {
            stanza.attrs.type = "error";
            stanza.attrs.from = new xmpp.JID(stanza.attrs.to).bare();
            stanza.attrs.to = client.jid;
            stanza.c("error", {type: "cancel", code: "503"}).c("service-unavailable", {xmlns: "urn:ietf:params:xml:ns:xmpp-stanzas"});
            client.send(stanza)
        }
        else {
            exports.store_offline_message(stanza);
        }
    });
}

exports.mod = RecipientOffline;

