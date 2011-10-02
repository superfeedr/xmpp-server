var xmpp = require('node-xmpp');
var r = require('../lib/roster.js');
var ltx = require('ltx');
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
    client.roster = new RosterStorage();
    
    client.on('auth-success', function(jid) {
        client.roster.owner = jid.bare().toString();
    });
    
    client.on('inStanza', function(stz) {
        var self = this;
        var stanza = ltx.parse(stz.toString());
        var query = null;
        if (stanza.is('iq') && (query = stanza.getChild('query', "jabber:iq:roster"))) {
            if(stanza.attrs.type === "get") {
                stanza.attrs.type = "result";
                RosterStorage.find(new xmpp.JID(stanza.attrs.from).bare().toString(), function(roster) {
                    roster.items.forEach(function(item) {
                        query.c("item", {jid: item.jid, name: item.name, subscription: item.state});
                    });
                    stanza.attrs.to = stanza.attrs.from;
                    client.emit('outStanza', stanza); 
                });
            }
            else if(stanza.attrs.type === "set") {
                var i = query.getChild('item', "jabber:iq:roster");
                RosterStorage.find(new xmpp.JID(stanza.attrs.from).bare().toString(), function(roster) {
                    RosterItemStorage.find(roster, new xmpp.JID(i.attrs.jid).bare().toString(), function(item) {
                        if(i.attrs.subscription === "remove") {
                            item.delete(function() {
                                // And now send to all sessions.
                                i.attrs.subscription = 'remove';
                                stanza.attrs.from = client.server.options.domain; // Remove the from field.
                                client.server.connectedClientsForJid(client.jid.toString()).forEach(function(jid) {
                                    stanza.attrs.to = jid.toString();
                                    client.server.emit('inStanza', stanza); // TODO: Blocking Outbound Presence Notifications.
                                });
                            });
                        } else {
                            if(item.state === "from" && i.attrs.subscription === "to") {
                                item.state = "both";
                            }
                            else if(item.state === "to" && i.attrs.subscription === "from") {
                                item.state = "both";
                            }
                            else {
                                item.state = i.attrs.subscription || "to";
                            }
                            item.name = i.attrs.name || i.attrs.jid;
                            item.save(function() {
                                // And now send to all sessions.
                                i.attrs.subscription = item.state;
                                stanza.attrs.from = client.server.options.domain; // Remove the from field.
                                client.server.connectedClientsForJid(client.jid.toString()).forEach(function(jid) {
                                    stanza.attrs.to = jid.toString();
                                    client.server.emit('inStanza', stanza); // TODO: Blocking Outbound Presence Notifications.
                                });
                            });
                        }
                    });
                });
            } else if(stanza.attrs.type === "result") {
                // Not much!
            }
        }
    });
}

exports.mod = Roster;
exports.configure = function(c2s, s2s) {
}

