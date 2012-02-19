var xmpp = require('node-xmpp');
var ltx = require('ltx');

// XEP-0054: vcard-temp
// http://xmpp.org/extensions/xep-0054.html

function VCard(client) {
    client.on('inStanza', function(stz) {
        var stanza = ltx.parse(stz.toString());
        if (stanza.is('iq') && (vCard = stanza.getChild('vCard', "vcard-temp"))) {
            stanza.attrs.type = "error";
            stanza.attrs.to = stanza.attrs.from;
            delete stanza.attrs.from;
            client.emit('outStanza', stanza);
        }
        return;
    });
}

exports.configure = function(server, config) {
}

