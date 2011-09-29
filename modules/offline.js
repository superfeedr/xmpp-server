var xmpp = require('node-xmpp');
var redis = require("redis").createClient();
var ltx = require("ltx");
    
redis.on("error", function (err) {
    console.log("Redis connection error to " + redis.host + ":" + redis.port + " - " + err);
});

function deliverNextOfflineMessageforClient(client) {
    redis.rpop(client.jid.bare().toString(), function(error, stanza) {
        if(stanza) {
            client.send(ltx.parse(stanza));
            deliverNextOfflineMessageforClient(client);
        }
    });
}

exports.deliverOfflineMessagesForClient = function(client) {
    deliverNextOfflineMessageforClient(client);
}

exports.storeOfflineMessage = function(c2s, stanza) {
    stanza.c("delay", {xmlns: 'urn:xmpp:delay', from: '', stamp: ISODateString(new Date())}).t("Offline Storage");
    jid = new xmpp.JID(stanza.attrs.to);
    redis.lpush(jid.bare().toString(), stanza, function() {
        redis.ltrim(jid.bare().toString(), 0, 9);
    });
}


function ISODateString(d) {
    function pad(n){
        return n<10 ? '0'+n : n
    }
    return d.getUTCFullYear()+'-'
    + pad(d.getUTCMonth()+1)+'-'
    + pad(d.getUTCDate())+'T'
    + pad(d.getUTCHours())+':'
    + pad(d.getUTCMinutes())+':'
    + pad(d.getUTCSeconds())+'Z'
}

