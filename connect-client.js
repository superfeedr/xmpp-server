/**
 * This attempts to connect to the XMPP server.
 **/
var sys = require('sys');
var xmpp = require('node-xmpp');
var argv = process.argv;

if (argv.length != 4) {
    sys.puts('Usage: node connect-client.js <my-jid> <my-password>');
    process.exit(1);
}

var cl = new xmpp.Client({
    jid: argv[2],
    password: argv[3]
});

cl.on('online', function () {
    cl.send(new xmpp.Element('presence', {}).c('show').t('chat').up().c('status').t('If I\'m online, then, I\'m fine!'));
    sys.puts('You win');
    process.exit(0);
});