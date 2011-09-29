var xmpp = require('node-xmpp');

// XEP-0054: vcard-temp
// http://xmpp.org/extensions/xep-0054.html

exports.name = "mod_vcard";

function VCardMixin(client) {
    client.on('inStanza', function(stanza) {
        if (stanza.is('iq') && (vCard = stanza.getChild('vCard', "vcard-temp"))) {
            stanza.attrs.type = "error";
            stanza.attrs.to = stanza.attrs.from;
            delete stanza.attrs.from;
            client.send(stanza);
        }
        return;
    });
}

exports.mod = VCardMixin;

