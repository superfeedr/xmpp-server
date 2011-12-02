var WebSocketServer   = require('websocket').server;
var HttpServer = require('http');
var util = require('util');
var EventEmitter = require('events').EventEmitter;


exports.name = "mod_websocket";

function WebsocketServer() {
}

// This is a wrapper around the ws.
function WebsocketWrapper(ws) {
    EventEmitter.call(this);
    
    var self = this;
    this.ws = ws;
    this.writable = true;
    
    this.ws.on('message', function(message) {
        if (message.type === 'utf8') {
            string = message.utf8Data
            if(string.match(/<stream:stream .*\/>/)) {
                string = string.replace("/>", ">");
            }
            self.emit('data', string);
        }
        else if (message.type === 'binary') {
            /* No support binary for now!*/
        }
    });
    this.ws.on('close', function(id) {
        self.emit('end');
    });
}

util.inherits(WebsocketWrapper, EventEmitter);

WebsocketWrapper.prototype.serializeStanza = function(s, clbk) {
    clbk(s.toString()); // No specific serialization
}

WebsocketWrapper.prototype.end = function() {
    this.ws.close();
}

WebsocketWrapper.prototype.write = function(data) {
    this.ws.sendUTF(data);
}


exports.mod = WebsocketServer;
exports.configure = function(c2s, s2s) {
    var http = HttpServer.createServer(function(request, response) {
        response.writeHead(404);
        response.end();
    });

    http.listen(5280, function() {
    });
    
    var ws = new WebSocketServer({
        httpServer: http,
        autoAcceptConnections: false
    });
    
    ws.on('request', function(request) {
        var socket = new WebsocketWrapper(request.accept(null, request.origin));
        c2s.acceptConnection(socket); // Let's go!
    });
}

