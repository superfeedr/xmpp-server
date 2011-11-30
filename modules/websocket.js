var WebSocketServer   = require('websocket').server;
var HttpServer = require('http');


exports.name = "mod_websocket";

function WebsocketServer() {
}

exports.mod = WebsocketServer;
exports.configure = function(c2s, s2s) {
    var http = HttpServer.createServer(function(request, response) {
        response.writeHead(404);
        response.end();
    });

    http.listen(5280, function() {
    });
    
    ws = new WebSocketServer({
        httpServer: http,
        autoAcceptConnections: false
    });
    
    ws.on('request', function(request) {
        if (!originIsAllowed(request.origin)) {
          // Make sure we only accept requests from an allowed origin
          request.reject();
          return;
        }

        var socket = request.accept(null, request.origin);
        
        /*Let's now prepare the API for socket*/
        socket.writable = true;
        socket.serializeStanza = function(s, clbk) {
            clbk(s.toString()); // No specific serialization
        }
        socket.end = function() {
            socket.close();
        }
        socket.write = function(data) {
            socket.sendUTF(data);
        }
        
        c2s.acceptConnection(socket); // Let's go!
        
        socket.on('message', function(message) {
            if (message.type === 'utf8') {
                string = message.utf8Data
                if(string.match(/<stream:stream .*\/>/)) {
                    string = string.replace("/>", ">");
                }
                socket.emit('data', string);
            }
            else if (message.type === 'binary') {
                /* No support binary for now!*/
            }
        });
        
        socket.on('close', function(id) {
            socket.emit('end');
        });
    });

    function originIsAllowed(origin) {
      // put logic here to detect whether the specified origin is allowed.
      return true;
    }
}

