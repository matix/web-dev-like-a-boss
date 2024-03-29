var http  = require('http'),
    io    = require('socket.io'),
    util  = require('util'),
    path  = require('path'),
    spawn = require('child_process').exec,
    ansi  = require('ansi-html-stream');
 
var server = http.createServer(function(req, res){
  res.writeHead(200);
  res.end("OK");
}).listen(8002);
 
var io_app  = io.listen(server),
    cwd = process.cwd(),
    currentProcess;

function getUserHome() {
  return process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE;
}

io_app.sockets.on('connection', function(socket){
  socket.on('exec', function(cmd){

    socket.emit("exec_init");

    cmd = cmd.trim();

    var cdm;
    if(cdm = cmd.match(/^\s*cd (.*)/)){
      cdm[1] = cdm[1].replace("~", getUserHome());
      var cwdt = path.resolve(cwd, cdm[1]);
      if(path.existsSync(cwdt)) {
        cwd = cwdt;
        socket.emit("stdout", cwd);
      }
      else {
        socket.emit("stderr", cwdt +" is not a valid path.");
      }

      socket.emit("exec_end");
      return;
    }

    if(!currentProcess){

      var isNPM = cmd.match(/^npm .*/g);

      currentProcess = spawn(cmd + (isNPM? " --color always":""), {
        cwd: cwd
      });

      currentProcess.stdout.pipe(ansi()).on('data', function(data) {
        socket.emit("stdout", String(data));
      });
       
      currentProcess.stderr.pipe(ansi()).on('data', function(data) {
        data = String(data);
        if(isNPM){
          socket.emit("stdout", data);
        }
        else{
          socket.emit("stderr", data);
        }
      });
       
      currentProcess.on('close', function (code) {
        socket.emit("exec_end", code);
        currentProcess = null;
      });
    }
    else {
      currentProcess.stdin.write(cmd + "\n");
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

