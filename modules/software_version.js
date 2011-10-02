var xmpp = require('node-xmpp');
var ltx = require('ltx');

// XEP-0092: Software Version
// http://xmpp.org/extensions/xep-0092.html
exports.name = "mod_version";

exports.default = {
    name: "node-xmpp Server",
    version: "1.3.3.7",
    os: "earth OS"
};

function SoftwareVersionMixin(client) {
    client.on('inStanza', function(stz) {
        var stanza = ltx.parse(stz.toString());
        if (stanza.is('iq') && (query = stanza.getChild('query', "jabber:iq:version"))) {
            stanza.attrs.type = "result";
            stanza.attrs.to = stanza.attrs.from;
            delete stanza.attrs.from;

            // Actual version attributes
            if(typeof(exports.name) === "undefined") {
                query.c("name").t(exports.default.name);
            }
            else {
                query.c("name").t(exports.name);
            }
            
            if(typeof(exports.version) === "undefined") {
                query.c("version").t(exports.default.version);
            }
            else {
                query.c("version").t(exports.version);
            }
            
            if(typeof(exports.os) === "undefined") {
                query.c("os").t(exports.default.os);
            }
            else {
                query.c("os").t(exports.os);
            }
            client.emit('outStanza', stanza); 
        }
    });
}

exports.mod = SoftwareVersionMixin;

