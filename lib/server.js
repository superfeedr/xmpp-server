var xmpp = require('node-xmpp');

// Loading all modules needed
var Logger = require('../modules/logger');
var Router = require('../modules/router');
var RecipientOffline = require('../modules/offline');
var SoftwareVersion = require('../modules/software_version'); 
var Presence = require('../modules/presence');
var Roster = require('../modules/roster');

// Loading non -xmpp libraries
var User = require('../lib/users.js').User;

exports.run = function(config) {
    // Using the right Router.
    xmpp.C2SServer.prototype.route = Router.route;
    xmpp.C2SServer.prototype.registerRoute = Router.registerRoute;
    xmpp.C2SServer.prototype.unregisterRoute = Router.unregisterRoute;
    xmpp.C2SServer.prototype.connectedClientsForJid = Router.connectedClientsForJid;

    // Creates the server.
    var c2s = new xmpp.C2SServer(config);
    var s2s = new xmpp.Router();
    
    /* THIS SYNTAX WILL PROBABLY BE DEPRECATED BY ASTRO, BUT HE NEEDS TO SUGGEST A REPLACEMENT! */
    s2s.register(config.domain, function(stanza) {
        c2s.route(stanza);
    });
    c2s.s2s = s2s;
    
    c2s.on("stanza", function(stanza, client) {
        s2s.send(stanza); // Allow for the incoming (from C2SStream) stanzas to be routed... we first route to the S2S component, which will then maybe forward to the C2SServer.. and this one may push it down to the right C2SStream
    });
    /* /THIS SYNTAX WILL PROBABLY BE DEPRECATED BY ASTRO. */

    // Allows the developer to authenticate users against anything they want.
    c2s.on("authenticate", function(jid, password, client, cb) {
        User.find(jid, function(user) {
            cb(user && user.attrs.password === password);
        });
    });

    // Allows the developer to register the jid against anything they want
    c2s.on("register", function(jid, password, client, cb) {
        User.register(jid, password, {
            success: function() {
                cb(true); 
            },
            error: function() {
                cb(false, {code: "409", type: "cancel", text: "conflict"}); 
            }
        });
    });

    // On Connect event. When a client connects.
    c2s.on("connect", function(client) {
        // That's the way you add mods to a given server.
        SoftwareVersion.name = "Node XMPP server example";
        SoftwareVersion.version = "0.0.0.1";
        SoftwareVersion.os = "Unknown";
        client.addMixin(Logger.mod);
        client.addMixin(SoftwareVersion.mod);
        client.addMixin(Presence.mod);
        client.addMixin(Roster.mod);
        client.on("online", function() {
            RecipientOffline.deliverOfflineMessagesForClient(client);
        });
    });
    
    // Called when a recipient to a stanza sent by c2s was offline.
    c2s.on("recipient_offline", function(stanza) {
        RecipientOffline.storeOfflineMessage(c2s, stanza);
    });

    // On Disconnect event. When a client disconnects
    c2s.on("disconnect", function(client) {

    });

    // Most imoortant pieces of code : that is where you can configure your XMPP server to support only what you care about/need.
    c2s.on("stanza", function(stanza, client) {
        var query, vCard;
        // We should provide a bunch of "plugins" for the functionalities below.

        // No private support on this server
        if (stanza.is('iq') && (query = stanza.getChild('query', "jabber:iq:private"))) {
            stanza.attrs.type = "error";
            stanza.attrs.to = stanza.attrs.from;
            delete stanza.attrs.from;
            client.send(stanza);
        }
        // No vCard support on this server.
        else if (stanza.is('iq') && (vCard = stanza.getChild('vCard', "vcard-temp"))) {
            stanza.attrs.type = "error";
            stanza.attrs.to = stanza.attrs.from;
            delete stanza.attrs.from;
            client.send(stanza);
        }
        // No DiscoInfo on this server.
        else if (stanza.is('iq') && (query = stanza.getChild('query', "http://jabber.org/protocol/disco#info"))) {
            stanza.attrs.type = "error";
            stanza.attrs.to = stanza.attrs.from;
            delete stanza.attrs.from;
            client.send(stanza);
        }
        // No Version support on this server.
        else {
        }
    });
}

