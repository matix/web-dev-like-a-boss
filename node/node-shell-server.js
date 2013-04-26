var http  = require('http'),
    io    = require('socket.io'),
    util  = require('util'),
    spawn = require('child_process').exec;
 
var server = http.createServer(function(req, res){
  res.writeHead(200);
  res.end("OK");
}).listen(8002);
 
var io_app  = io.listen(server),
    currentProcess;

io_app.sockets.on('connection', function(socket){
  socket.on('exec', function(cmd){
    socket.emit("exec_init");
    if(!currentProcess){
      currentProcess = spawn(cmd);

      currentProcess.stdout.on('data', function(data) {
        socket.emit("stdout", String(data));
      });
       
      currentProcess.stderr.on('data', function(data) {
        socket.emit("stderr", String(data));
      });
       
      currentProcess.on('close', function (code) {
        socket.emit("exec_end", code);
        currentProcess = null;
      });
    }
    else {
      socket.emit("exec_end");
    }
  });

  socket.on('kill', function(cmd){
    if(currentProcess){
      process.kill(currentProcess.pid);
    }
    socket.emit("kill_ok");
  });


});

