var xmpp = require('node-xmpp');
var ltx = require('ltx');

// XEP-0030: Service Discovery
// http://xmpp.org/extensions/xep-0030.html

exports.name = "mod_disco_info";

function DiscoInfoMixin(client) {
    client.on('stanza', function(stz) {
        var stanza = ltx.parse(stz.toString());
        if (stanza.is('iq') && (query = stanza.getChild('query', "http://jabber.org/protocol/disco#info"))) {
            stanza.attrs.type = "error";
            stanza.attrs.to = stanza.attrs.from;
            delete stanza.attrs.from;
            client.send(stanza);
        } else if (stanza.is('iq') && (query = stanza.getChild('query', "http://jabber.org/protocol/disco#items"))) {
            stanza.attrs.type = "error";
            stanza.attrs.to = stanza.attrs.from;
            delete stanza.attrs.from;
            client.send(stanza);
        }
    });
}

exports.mod = DiscoInfoMixin;
exports.configure = function(c2s, s2s) {
}

