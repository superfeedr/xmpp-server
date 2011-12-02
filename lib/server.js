var xmpp        = require('node-xmpp');

// Loading all modules needed
var Logger              = require('../modules/logger');
var Router              = require('../modules/router').Router;
var RecipientOffline    = require('../modules/offline');
var Roster              = require('../modules/roster');
var Websocket           = require('../modules/websocket');
var DiscoInfo           = require('../modules/disco_info');

// Loading non -xmpp libraries
var User = require('../lib/users.js').User;

exports.run = function(config, ready) {
    
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
    Websocket.configure(c2s, s2s, config.websocket);
    Roster.configure(c2s, s2s);
    DiscoInfo.configure(c2s, s2s);
    
    // On Connect event. When a client connects.
    c2s.on("connect", function(client) {
        client.addMixin(Logger.mod);
        client.addMixin(RecipientOffline.mod);
        client.addMixin(Roster.mod);
        client.addMixin(DiscoInfo.mod);
        
        // Allows the developer to authenticate users against anything they want.
        client.on("authenticate", function(opts, cb) {
            User.find(opts.jid, function(user) {
                if(!user) {
                    cb(new Error("No such user"));
                }
                else if(user.auth(opts.password)) {
                    cb();
                }
                else {
                    user.token_auth(opts.password, function(result) {
                        if(result)
                            cb();
                        else
                            cb(new Error("Wrong password"));
                    });
                }
            });
        });

        // Allows the developer to register the jid against anything they want
        client.on("register", function(opts, cb) {
            cb(false, {code: "406", type: "cancel", text: "denied"}); 
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
        // Not much to do for now.
        client.logger.info("Client disconnected");
    });

    // This is a callback to trigger when the server is ready. That's very useful when running a server in some other code.
    // We may want to make sure this is the right place for it in the future as C2S and S2S may not be abll ready.
    ready();
}

