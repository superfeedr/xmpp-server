var xmpp = require('node-xmpp');
var ltx = require('ltx');

// XEP-0030: Service Discovery
// http://xmpp.org/extensions/xep-0030.html

function DiscoInfo() {
}

exports.configure = function(server, config) {
    server.on('connect', function(client) {
        client.on('stanza', function(stz) {
            var query = null;
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
    });
}

