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

var SessionManager = require('../lib/session.js').SessionManager;

// Loading non -xmpp libraries
var User = require('../lib/users.js').User;

exports.run = function(config) {

    // That's the way you add mods to a given server.
    SoftwareVersion.name = "Node XMPP server example";
    SoftwareVersion.version = "0.0.0.1";
    SoftwareVersion.os = "Unknown";


    // Creates the server.
    var s2sRouter = new xmpp.Router();
    var c2s = new xmpp.C2SServer(config.c2s);
    var sessions = new SessionManager();

    c2s.on('connect', function(conn) {
	// Client connected
	var jid;
	conn.on('authenticate', function(opts, cb) {
	    var jid = opts.jid;
	    User.find(jid.toString(), function(user) {
		if (user && user.attrs.password === opts.password) {
		    cb();
		} else
		    cb(new Error("Authentication failure"));
	    });
	});

	conn.on('online', function() {
	    sessions.addClient(jid, conn);
	});
    });

    // Allows the developer to register the jid against anything they want
    c2s.on("register", function(opts, cb) {
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

    // Configure the mods at the server level!
    /*Logger.configure(c2s, s2sRouter);
    RecipientOffline.configure(c2s, s2sRouter);
    SoftwareVersion.configure(c2s, s2sRouter);
    Presence.configure(c2s, s2sRouter);
    Roster.configure(c2s, s2sRouter);
    DiscoInfo.configure(c2s, s2sRouter);
    VCard.configure(c2s, s2sRouter);
    Websocket.configure(c2s, s2sRouter);*/

    /* ======================================================================================== */
    s2sRouter.register(config.domain, function(stanza) {
        //c2s.router.route(stanza);
    });
};
