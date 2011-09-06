#!/usr/bin/env node

if(process.argv.length === 2) {
    console.log("Please provide a path to a config path.");
    process.exit(1);
}

var configuration = require(process.argv[process.argv.length -1]);

var srv = require('./lib/server.js'); 
srv.run(configuration.config);



