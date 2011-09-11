var xmpp = require('node-xmpp');

http://xmpp.org/rfcs/rfc3921.html#roster
exports.name = "roster";

function Roster(client) {
    client.on('stanza', function(stanza) {
    });
}

exports.mod = Roster;

