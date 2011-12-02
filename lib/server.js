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

exports.run = function(config, ready) {
    
    // That's the way you add mods to a given server.
    SoftwareVersion.name = "Node XMPP server example";
    SoftwareVersion.version = "0.0.0.1";
    SoftwareVersion.os = "Unknown";
    
    // Creates the server.
    var c2s = new xmpp.C2SServer(config);
    c2s.router = new Router(c2s); // Using the right C2S Router.
    var s2s = new xmpp.Router(config.s2sPort, config.bindAddress); // We only use 5269 has the default S2S port.
    
    // S2S plugged to C2S.
    s2s.register(config.domain, function(stanza) {
        c2s.router.route(stanza); 
    });
    c2s.s2s = s2s;
    
    // Configure the mods at the server level!
    Logger.configure(c2s, s2s);
    RecipientOffline.configure(c2s, s2s);
    SoftwareVersion.configure(c2s, s2s);
    Presence.configure(c2s, s2s);
    Roster.configure(c2s, s2s);
    DiscoInfo.configure(c2s, s2s);
    VCard.configure(c2s, s2s);
    Websocket.configure(c2s, s2s, config.websocket);
    
    // On Connect event. When a client connects.
    c2s.on("connect", function(client) {
        client.addMixin(Logger.mod);
        client.addMixin(RecipientOffline.mod);
        client.addMixin(SoftwareVersion.mod);
        client.addMixin(Presence.mod);
        client.addMixin(Roster.mod);
        client.addMixin(DiscoInfo.mod);
        client.addMixin(VCard.mod);
        
        // Allows the developer to authenticate users against anything they want.
        client.on("authenticate", function(opts, cb) {
            User.find(opts.jid, function(user) {
                if (user && user.attrs.password === opts.password)
                    cb();
                else
                    cb(new Error("Authentication failure"));
            });
        });

        // Allows the developer to register the jid against anything they want
        client.on("register", function(opts, cb) {
            User.register(opts.jid, opts.password, {
                success: function() {
                    cb(true);
                },
                error: function() {
                    var err = new Error("conflict");
                    err.code = 409;
                    err.type = "cancel";
                    cb(err);
                }
            });
        });
        
        // When the user is online, let's register the route. there could be other things involed here... like presence! 
        client.on('online', function() {
            c2s.router.registerRoute(client.jid, client);
        });
        
        // When the user is offline, we remove him from the router.
        client.on('end', function() {
            if(client.jid) {
                // We may not have a jid just yet if the client never connected before
                c2s.router.unregisterRoute(client.jid, client);
            }
        });
        
        // this callback is called when the client sends a stanza.
        client.on('stanza', function(stanza) {
            c2s.router.route(stanza, client);  // Let's send the stanza to the router and let the router decide what to do with it.
        });
    });

    // On Disconnect event. When a client disconnects
    c2s.on("disconnect", function(client) {

    });

    // This is a callback to trigger when the server is ready. That's very useful when running a server in some other code.
    // We may want to make sure this is the right place for it in the future as C2S and S2S may not be abll ready.
    ready();
}

