var xmpp = require('node-xmpp');
var r = require('../lib/roster.js');
var RosterStorage = r.Roster;
var RosterItemStorage = r.RosterItem;

// http://xmpp.org/rfcs/rfc3921.html#roster
exports.name = "roster";

/* Items have : 
    - key(jid)
    - state
    - name
    - groups [Not supported here for now TODO]
*/

function Roster(client) {
    client.on('inStanza', function(stanza) {
        if (stanza.is('iq') && (query = stanza.getChild('query', "jabber:iq:roster"))) {
            if(stanza.attrs.type === "get") {
                stanza.attrs.type = "result";
                RosterStorage.find(stanza.attrs.from, function(roster) {
                    roster.items.forEach(function(item) {
                        query.c("item", {jid: item.jid, name: item.name, subscription: item.state});
                    });
                    stanza.attrs.to = stanza.attrs.from;
                    client.send(stanza);
                });
            }
            else if(stanza.attrs.type === "set") {
                var i = query.getChild('item', "jabber:iq:roster");
                RosterStorage.find(stanza.attrs.from, function(roster) {
                    RosterItemStorage.find(roster, i.attrs.jid, function(item) {
                        item.state = i.attrs.subscription || "none";
                        item.name = i.attrs.name;
                        item.save(function() {
                            // And now send to all sessions.
                            i.attrs.subscription = item.state;
                            stanza.attrs.from = ""; // Remove the from field.
                            client.server.connectedClientsForJid(stanza.attrs.from).forEach(function(jid) {
                                stanza.attrs.to = jid.toString();
                                client.server.s2s.send(stanza); // TODO: Blocking Outbound Presence Notifications.
                            });
                        });
                    });
                });
            } else if(stanza.attrs.type === "result") {
                // Not much!
            }
        }
    });
}

exports.mod = Roster;

