var xmpp        = require('node-xmpp');

// Loading all modules needed
var Logger              = require('../modules/logger');
var Router              = require('../modules/router').Router;
var RecipientOffline    = require('../modules/offline');
var SoftwareVersion     = require('../modules/software_version'); 
var Presence            = require('../modules/presence');
var Roster              = require('../modules/roster');
var DiscoInfo           = require('../modules/disco_info');
var VCard               = require('../modules/vcard');
var Websocket           = require('../modules/websocket');

// Loading non -xmpp libraries
var User = require('../lib/users.js').User;

exports.run = function(config) {
    
    // That's the way you add mods to a given server.
    SoftwareVersion.name = "Node XMPP server example";
    SoftwareVersion.version = "0.0.0.1";
    SoftwareVersion.os = "Unknown";
    

    // Creates the server.
    var c2s = new xmpp.C2SServer(config);
    c2s.router = new Router(c2s); // Using the right Router.
    var s2s = new xmpp.Router();
    
    // Configure the mods at the server level!
    Logger.configure(c2s, s2s);
    RecipientOffline.configure(c2s, s2s);
    SoftwareVersion.configure(c2s, s2s);
    Presence.configure(c2s, s2s);
    Roster.configure(c2s, s2s);
    DiscoInfo.configure(c2s, s2s);
    VCard.configure(c2s, s2s);
    Websocket.configure(c2s, s2s);
    
    /* ======================================================================================== */
    /* THIS SYNTAX WILL PROBABLY BE DEPRECATED BY ASTRO, BUT HE NEEDS TO SUGGEST A REPLACEMENT! */
    s2s.register(config.domain, function(stanza) {
        c2s.router.route(stanza); 
    });
    c2s.s2s = s2s;
    
    c2s.on('inStanza', function(client, stanza) {
        client.emit('inStanza', stanza);
        // We need to find a way to not call this when any other signal called it!
        // Also, it is a problem as one of the callback may alter the stanza... and we may want to _not_ forward that changed stanza!
        // We have the problem for several examples, like this one: when susbcribing to another user, some clients (Psi) will send <presence type="subscribe" from="julien@zipline.local/res" to="friend@zipline.local" /> the problem is that the we need to clean the from attribute to remove the resource. How can we do that?
        c2s.router.route(stanza); // Allow for the incoming (from C2SStream) stanzas to be routed... we first route to the S2S component, which will then maybe forward to the C2SServer.. and this one may push it down to the right C2SStream
    });
    /* /THIS SYNTAX WILL PROBABLY BE DEPRECATED BY ASTRO. */
    /* ======================================================================================== */

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
        client.addMixin(Logger.mod);
        client.addMixin(RecipientOffline.mod);
        client.addMixin(SoftwareVersion.mod);
        client.addMixin(Presence.mod);
        client.addMixin(Roster.mod);
        client.addMixin(DiscoInfo.mod);
        client.addMixin(VCard.mod);
    });

    // On Disconnect event. When a client disconnects
    c2s.on("disconnect", function(client) {

    });
}

