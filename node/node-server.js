var app = require('http').createServer(handler), 
    io = require('socket.io').listen(app), 
    fs = require('fs'),
    util = require('util');

app.listen(8001);

function handler (req, res) {
    res.writeHead(200);
    res.end("OK");
}

io.sockets.on('connection', function (socket) {
  var consoleWrapper = {
      log:function () {
        socket.emit("stdout", [].slice.call(arguments).map(util.format).join("\n"));
      }
    }

  socket.on('exec', function (data) {
    try {
        var result = (new Function("console", "require", "return " + data))(consoleWrapper, require);
        socket.emit("stdout", util.format(result));
        console.log(result);
    }
    catch(e){
        socket.emit("stderr", util.format(e));
        console.log(e);
    }
  });

  socket.on('suggestion_query', function (data) {
    try {
        if(data && data.trim().indexOf(".") === data.length -1) {
            data = data.substr(0,data.length-1);
            var result = (new Function("console", "require", "return " + data))(consoleWrapper, require),
                suggestions = [];

            if(result) {
                Object.keys(result).forEach(function(prop) {
                    suggestions.push(data + "." + prop);
                });
            }
            else {
                suggestions = false;
            }
            
            socket.emit("suggestion", suggestions);
        }
        
    }
    catch(e){socket.emit("suggestion", false);}
  });
});