var util = require('util');
var User = require('../lib/users.js').User;
var argv = process.argv;

if (argv.length != 4) {
    util.puts('Usage: node add_user.js <my-jid> <my-password>');
    process.exit(1);
}


User.register(argv[2], argv[3], {
    success: function() {
        console.log(argv[2] + " added.");
        process.exit(0);
    },
    error: function() {
        console.log(argv[2] + " couldn't ve added. (conflict)");
        process.exit(1);
    }
})

