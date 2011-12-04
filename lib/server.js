var xmpp        = require('node-xmpp');

// Loading all modules needed
var Logger      = require('../modules/logger');
var Router      = require('../modules/router').Router;
var Offline     = require('../modules/offline');
var Version     = require('../modules/version'); 
var Presence    = require('../modules/presence');
var Roster      = require('../modules/roster');
var DiscoInfo   = require('../modules/disco_info');
var VCard       = require('../modules/vcard');
var Websocket   = require('../modules/websocket');

// Loading non -xmpp libraries
var User = require('../lib/users.js').User;

exports.run = function(config, ready) {
    
    // Creates the server.
    var server = new xmpp.C2SServer(config);
    server.router = new Router(server); // Using the right C2S Router.
    var s2s = new xmpp.Router(config.s2sPort, config.bindAddress); // We only use 5269 has the default S2S port.
    
    // S2S plugged to C2S.
    s2s.register(config.domain, function(stanza) {
        server.router.route(stanza); 
    });
    server.s2s = s2s;
    
    // Configure the mods at the server level!
    Logger.configure(server, config.logger);
    Offline.configure(server, config.offline);
    Version.configure(server, config.version);
    Presence.configure(server, config.presence);
    Roster.configure(server, config.roster);
    DiscoInfo.configure(server, config.disco);
    VCard.configure(server, config.vcard);
    Websocket.configure(server, config.websocket);
    
    // On Connect event. When a client connects.
    server.on("connect", function(client) {
        
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
            server.router.registerRoute(client.jid, client);
        });
        
        // When the user is offline, we remove him from the router.
        client.on('end', function() {
            if(client.jid) {
                // We may not have a jid just yet if the client never connected before
                server.router.unregisterRoute(client.jid, client);
            }
        });
        
        // this callback is called when the client sends a stanza.
        client.on('stanza', function(stanza) {
            server.router.route(stanza, client);  // Let's send the stanza to the router and let the router decide what to do with it.
        });
    });

    // On Disconnect event. When a client disconnects
    server.on("disconnect", function(client) {

    });

    // This is a callback to trigger when the server is ready. That's very useful when running a server in some other code.
    // We may want to make sure this is the right place for it in the future as C2S and S2S may not be abll ready.
    ready();
}

