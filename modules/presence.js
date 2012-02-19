var xmpp = require('node-xmpp');
var ltx = require('ltx');

// http://xmpp.org/extensions/xep-0160.html

// TODO
// Deal with 5.1.4.  Directed Presence. 
// PROBLEM : HOW DO WE INTERRUPT A STANZA?
// IMPLEMENT PRIORITY (IN ROUTER AS WELL!)
// 

function Presence() {
    client.initial_presence_sent = false;
    
    client.on('inStanza', function(stz) {
        var stanza = ltx.parse(stz.toString());
        if (stanza.is('presence')) {
            // Ok, now we must do things =)
            if ((!stanza.attrs.to || stanza.attrs.to === client.server.options.domain) && !stanza.attrs.type) {
                // Section 5.1.1 in http://xmpp.org/rfcs/rfc3921.html#presence
                if(!client.initial_presence_sent) {
                    client.initial_presence_sent = true;
                    if(client.roster) {
                        client.roster.eachSubscription(["to", "both"], function(item) {
                            stanza.attrs.type = "probe";
                            stanza.attrs.to = item.jid;
                            client.server.emit('inStanza', client, stanza); // TODO: Blocking Outbound Presence Notifications.
                        });
                        client.roster.subscriptions(["from", "both"], function(jids) {
                            jids.forEach(function(jid) {
                                stanza.attrs.to = jid;
                                client.server.emit('inStanza', client, stanza); // TODO: Blocking Outbound Presence Notifications.
                            });
                        });
                    }
                    // Send the presence to the other resources for this jid, if any.
                    client.server.router.connectedClientsForJid(stanza.attrs.from).forEach(function(jid) {
                        if(client.jid.resource != jid.resource) {
                            stanza.attrs.to = jid.toString();
                            client.server.emit('inStanza', client, stanza); // TODO: Blocking Outbound Presence Notifications.
                        }
                    })
                }
                // Section 5.1.2 in http://xmpp.org/rfcs/rfc3921.html#presence
                if((!stanza.attrs.type || stanza.attrs.type === "unavailable") && client.initial_presence_sent) {
                    if(client.roster) {
                        client.roster.subscriptions(["from", "both"], function(jids) {
                            jids.forEach(function(jid) {
                                stanza.attrs.to = jid;
                                client.server.emit('inStanza', client, stanza); // TODO: Blocking Outbound Presence Notifications.
                            });
                        });
                    }
                }
            } else {
                if(stanza.attrs.type === "subscribe") {
                    if(client.roster) {
                        client.roster.add(new xmpp.JID(stanza.attrs.from).bare().toString(), function(item) {
                            if(['both', 'to'].indexOf(item.state) == -1) {
                                client.roster.emit('add', item);
                            }
                        });
                    }
                }
            }
        }
    });

    client.on('outStanza', function(stz) {
        // Section 5.1.3 in http://xmpp.org/rfcs/rfc3921.html#presence
        // TODO : HANDLE THINGS WHENE THE CLIENT IS OFFLINE TOO!
        var stanza = ltx.parse(stz.toString());
        if (stanza.is('presence')) {
            if(stanza.attrs.type === "probe") {
                if(client.roster) {
                    client.roster.itemForJid(new xmpp.JID(stanza.attrs.from).bare().toString(), function(item) {
                        if(["from", "both"].indexOf(item.state) >= 0) {
                            // TODO: Blocking Outbound Presence Notifications.
                            var clients = client.router.connectedClientsForJid(new xmpp.JID(stanza.attrs.to).bare().toString());
                            var presence = null;
                            if(clients.length === 0) {
                                presence = new xmpp.Element('presence', {from: client.jid.bare().toString(), type: "error", to: stanza.attrs.from});
                            } else {
                                // We actually need to send the last received presence..; which means we have to store it! TODO
                                presence = new xmpp.Element('presence', {from: client.jid.bare().toString(),  to: stanza.attrs.from});
                            }
                            client.server.emit('inStanza', client, stanza); // TODO: Blocking Outbound Presence Notifications.
                        }
                        else {
                            // Send an error!
                            var error = new xmpp.Element('presence', {from: client.jid.bare().toString(), type: "error", to: stanza.attrs.from});
                            client.server.emit('inStanza', client, error); 
                        }
                    });
                }
            }
        }
    });
    
    client.on('disconnect', function() {
        // We need to send a <presence type="offline" > on his behalf
        var stanza = new xmpp.Element('presence', {from: client.jid.toString(), type: "unavailable" });
        client.server.router.connectedClientsForJid(client.jid.toString()).forEach(function(jid) {
            if(client.jid.resource != jid.resource) {
                stanza.attrs.to = jid.toString();
                client.server.emit('inStanza', client, stanza); // TODO: Blocking Outbound Presence Notifications.
            }
        });
        client.roster.eachSubscription(["from", "both"], function(item) {
            stanza.attrs.to = item.jid;
            client.server.emit('inStanza', client, stanza); // TODO: Blocking Outbound Presence Notifications.
        });
    });
}

exports.configure = function(server, config) {
    server.router.on("recipientOffline", function(stanza) {
        if(stanza.is("presence")) {
            //console.log("PRESENCE FOR OFFLINE USER!");
        }
    });
}

