/**
 * Created by le on 26/02/15.
 */

var http = require('http');
var fs = require('fs');
var path = require('path');
var mime = require('mime');
var chatServer = require('./lib/chat_server.js');
var cache = {};

// the first helper function for 404 error
function send404(res) {
    res.writeHead(404, {'content-type': 'text/plain'});
    res.write('Error 404, resource not found');
    res.end();
}

// the second helper function for sending a file.
function sendFile(res, filePath, fileContents) {
    res.writeHead(200, {'content-type': mime.lookup(path.basename(filePath))});
    res.end(fileContents);
}

// the third helper function for cache the static files
function serveStatic(res, cache, absPath) {
    if (cache[absPath]) {
        sendFile(res, absPath, cache[absPath]);
    } else {
        fs.exists(absPath, function(exists) {
            if (exists) {
                fs.readFile(absPath, function(err, data) {
                    if (err) {
                        send404(res);
                    } else {
                        cache[absPath] = data;
                        sendFile(res, absPath, data);
                    }
                });
            } else {
                send404(res);
            }
        });
    }
}

var server = http.createServer(function (req, res) {
    var filePath = false;
    if (req.url == '/') {
        filePath = 'public/index.html';
    } else {
        filePath = 'public' + req.url;
    }

    var absPath = './' + filePath;
    serveStatic(res, cache, absPath);
});

chatServer.listen(server);

server.listen(3000, function () {
    console.log('Server listening at port 3000');
});