var xmpp = require('node-xmpp');
var r = require('../lib/roster.js');
var ltx = require('ltx');
var RosterStorage = r.Roster;
var RosterItemStorage = r.RosterItem;

// http://xmpp.org/rfcs/rfc3921.html#roster
/* Items have : 
- key(jid)
- state
- name
- groups [Not supported here for now TODO]
*/

function Roster() {
}

exports.configure = function(server, config) {

    server.on("connect", function(client) {
        client.roster = new RosterStorage();

        client.roster.on('add', function(item) {
            // console.log("USER JUST SUBSCRIBED AND WANTS TO ADD A ROSTER ITEM");
            //
            // <iq type='set'>
            //   <query xmlns='jabber:iq:roster'>
            //     <item
            //         jid='contact@example.org'
            //         subscription='none'
            //         ask='subscribe'
            //         name='MyContact'>
            //       <group>MyBuddies</group>
            //     </item>
            //   </query>
            // </iq>
        });

        client.on('auth-success', function(jid) {
            client.roster.owner = jid.bare().toString();
        });

        client.on('stanza', function(stz) {
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
                        client.send(stanza); 
                    });
                }
                else if(stanza.attrs.type === "set") {
                    stanza.attrs.type = "result";
                    var i = query.getChild('item', "jabber:iq:roster");
                    RosterStorage.find(new xmpp.JID(stanza.attrs.from).bare().toString(), function(roster) {
                        RosterItemStorage.find(roster, new xmpp.JID(i.attrs.jid).bare().toString(), function(item) {
                            if(i.attrs.subscription === "remove") {
                                item.delete(function() {
                                    // And now send to all sessions.
                                    i.attrs.subscription = 'remove';
                                    stanza.attrs.from = client.server.options.domain; // Remove the from field.
                                    client.server.router.connectedClientsForJid(client.jid.toString()).forEach(function(jid) {
                                        stanza.attrs.to = jid.toString();
                                        client.send(stanza); // TODO: Blocking Outbound Presence Notifications.
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
                                    client.server.router.connectedClientsForJid(client.jid.toString()).forEach(function(jid) {
                                        stanza.attrs.to = jid.toString();
                                        client.send(stanza); // TODO: Blocking Outbound Presence Notifications.
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
    });
}

