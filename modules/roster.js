var xmpp = require('node-xmpp');

// http://xmpp.org/rfcs/rfc3921.html#roster
exports.name = "roster";

/* Items have : 
    - key(jid)
    - state
    - name
    - groups [Not supported here for now TODO]
*/

function Roster(client) {
    client.on('stanza', function(stanza) {
        if (stanza.is('iq') && (query = stanza.getChild('query', "jabber:iq:roster"))) {
        
    });
}

exports.mod = Roster;

