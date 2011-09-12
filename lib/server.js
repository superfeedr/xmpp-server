var xmpp = require('node-xmpp');

// Loading all modules needed
var SoftwareVersion = require('../modules/software_version'); 
var RecipientOffline = require('../modules/offline');
var Presence = require('../modules/presence');
var Roster = require('../modules/roster');
var Logger = require('../modules/logger');

var User = require('../lib/users.js').User;

exports.run = function(config) {
    // Sets up the server.
    var c2s = new xmpp.C2S(config);

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
        SoftwareVersion.os = "Mac OS X 10.7 Lion";
        // client.addMixin(Logger.mod);
        client.addMixin(SoftwareVersion.mod);
        client.addMixin(Presence.mod);
        client.addMixin(Roster.mod);
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
    })



    // You can also decide to rewrite many things, like for example the way you route stanzas.
    // This will allow for clustering for your node-xmpp server, using redis's PubSub feature.
    // To run this example in its full "power", just run node exmaple c2s.js from 2 different machines, as long as they share the redis server, they should be able to communicate!
    // var sys = require("sys");
    // var redis = require("redis-node");
    // var redispub = redis.createClient();   
    // var redissub = redis.createClient();   
    // 
    // xmpp.C2S.prototype.route = function(stanza) {
    //     var self = this;
    //     if(stanza.attrs && stanza.attrs.to) {
    //         var toJid = new xmpp.JID(stanza.attrs.to);
    //         redispub.publish(toJid.bare().toString(), stanza.toString());
    //     }
    // }
    // xmpp.C2S.prototype.registerRoute = function(jid, client) {
    //     redissub.subscribeTo(jid.bare().toString(), function(channel, stanza, pattern) {
    //         client.send(stanza);
    //     });
    //     return true;
    // }
}

