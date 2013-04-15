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

  function evaluate(data) {
      var console = consoleWrapper;
      //Careful kids, don't try this at home...
      return eval(data);
  }

  socket.on('exec', function (data) {
    try {
        var result = evaluate(data);
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
        if(data && data.search(/\(|\{|\[/) == -1 && (data = data.split(".")) && data.length) {
            var pre = data.slice(0,-1).join("."),
                needle = data[data.length-1],
                result = evaluate(pre),
                suggestions;
            if(result) {
                suggestions = Object.keys(result)
                .slice(0,40)
                .filter(function (prop){
                    return prop.indexOf(needle) === 0;
                }).map(function(prop) {
                    return pre + "." + prop;
                });
            }
            else {
                suggestions = false;
            }
            
            socket.emit("suggestion", suggestions);
        }
        else {
            socket.emit("suggestion", false);
        }
    }
    catch(e){ console.log(e); socket.emit("suggestion", false);}
  });
});