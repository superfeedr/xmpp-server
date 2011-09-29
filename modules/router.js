var xmpp = require('node-xmpp');

/**
* C2S Router */
exports.route = function(stanza) {
    var self = this;
    stanza.attrs.xmlns = 'jabber:client';
    if (stanza.attrs && stanza.attrs.to) {
        var toJid = new xmpp.JID(stanza.attrs.to);
        if (self.sessions.hasOwnProperty(toJid.bare().toString())) {
            // Now loop over all the sesssions and only send to the right jid(s)
            var sent = false, resource;
            for (resource in self.sessions[toJid.bare().toString()]) {
                if (toJid.bare().toString() === toJid.toString() || toJid.resource === resource) {
                    self.sessions[toJid.bare().toString()][resource].client.send(stanza);
                    sent = true;
                }
            }
            // We couldn't find a connected jid that matches the destination. Let's send it to everyone
            if (!sent) {
                for (resource in self.sessions[toJid.bare().toString()]) {
                    self.sessions[toJid.bare().toString()][resource].client.send(stanza);
                    sent = true;
                }                
            }
            // We couldn't actually send to anyone!
            if (!sent) {
                delete self.sessions[toJid.bare().toString()];
                self.emit("recipient_offline", stanza);
            }
        }
        else {
            self.emit("recipient_offline", stanza);
        }
    }
    else {
        // Huh? Who is it for? and why did it end up here?
        // TODO: reply with error
    }
};

/**
 * Registers a route (jid => specific client connection)
 */
exports.registerRoute = function(jid, client) {
    // What if we have a conflict! TOFIX
    if (!this.sessions.hasOwnProperty(jid.bare().toString()))
        this.sessions[jid.bare().toString()] = {}; 
    this.sessions[jid.bare().toString()][jid.resource] = client;
    return true;
};

/**
 * Returns the list of jids connected for a specific jid.
 */
exports.connectedClientsForJid = function(jid) {
    jid = new xmpp.JID(jid);
    if (!this.sessions.hasOwnProperty(jid.bare().toString())) {
        return [];
    }
    else {
        var jids = [];
        for(var resource in this.sessions[jid.bare().toString()]) {
            jids.push(new xmpp.JID(jid.bare().toString() + "/" + resource));
        }
        return jids;
    }
};

/**
 * Unregisters a route (jid => specific client connection)
 */
exports.unregisterRoute = function(jid, client) {
    if (!this.sessions.hasOwnProperty(jid.bare().toString())) {
        // Hum. What? That can't be.
    } else {
        delete this.sessions[jid.bare().toString()][jid.resource];
    }
    return true;
};
