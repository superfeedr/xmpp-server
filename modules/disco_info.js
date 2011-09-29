var xmpp = require('node-xmpp');

// XEP-0030: Service Discovery
// http://xmpp.org/extensions/xep-0030.html

exports.name = "mod_disco_info";

function DiscoInfoMixin(client) {
    client.on('inStanza', function(stanza) {
        if (stanza.is('iq') && (query = stanza.getChild('query', "http://jabber.org/protocol/disco#info"))) {
            stanza.attrs.type = "error";
            var to = stanza.attrs.to;
            stanza.attrs.to = stanza.attrs.from;
            stanza.attrs.from = to;
            client.send(stanza);
        } else if (stanza.is('iq') && (query = stanza.getChild('query', "http://jabber.org/protocol/disco#items"))) {
            stanza.attrs.type = "error";
            var to = stanza.attrs.to;
            stanza.attrs.to = stanza.attrs.from;
            stanza.attrs.from = to;
            client.send(stanza);
        }
        return;
    });
}

exports.mod = DiscoInfoMixin;

