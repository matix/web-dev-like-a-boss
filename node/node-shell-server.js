var http  = require('http'),
    io    = require('socket.io'),
    util  = require('util'),
    spawn = require('child_process').spawn;
 
var sh = spawn('bash');
 
var server = http.createServer(function(req, res){
  res.writeHead(200);
  res.end("OK");
}).listen(8002);
 
var io_app  = io.listen(server);

io_app.sockets.on('connection', function(socket){
  socket.on('exec', function(cmd){
    socket.emit("exec_init");
    sh.stdin.write(cmd+"\n");
  });

  sh.stdout.on('data', function(data) {
    socket.emit("stdout", String(data));
    socket.emit("exec_end");
  });
   
  sh.stderr.on('data', function(data) {
    socket.emit("stderr", String(data));
    socket.emit("exec_end");
  });
   
  sh.on('exit', function (code) {
    socket.emit("stderr", '** Shell exited: '+code+' **');
  });

});

