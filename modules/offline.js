var xmpp = require('node-xmpp');
var message = require('../lib/message.js');
var Message = message.Message;
var ltx = require('ltx');

// http://xmpp.org/extensions/xep-0160.html
exports.name = "offline";

function RecipientOffline(client) {
    client.on("online", function() {
        Message.for(client.jid.bare().toString(), function(message) {
            client.emit('outStanza', ltx.parse(message.stanza));
        });
    });
}

exports.mod = RecipientOffline;
exports.configure = function(c2s, s2s) {
    c2s.on("recipient_offline", function(stanza) {
        if(stanza.is("message")) {
            stanza.c("delay", {xmlns: 'urn:xmpp:delay', from: '', stamp: ISODateString(new Date())}).t("Offline Storage");
            (new Message(new xmpp.JID(stanza.attrs.to).bare().toString(), stanza.toString())).save(function() {
                // not much
            });
        }
    });
}

function ISODateString(d) {
    function pad(n){
        return n<10 ? '0'+n : n
    }
    return d.getUTCFullYear()+'-'
    + pad(d.getUTCMonth()+1)+'-'
    + pad(d.getUTCDate())+'T'
    + pad(d.getUTCHours())+':'
    + pad(d.getUTCMinutes())+':'
    + pad(d.getUTCSeconds())+'Z'
}

