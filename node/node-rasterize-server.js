var connect = require("connect"),
    fs = require("fs"),
    exec = require("child_process").spawn;

var app = connect();    

//app.use(connect.logger());
app.use(connect.query());
app.use("/rasterize", function (req, res) {
  var url = req.query.q,
      dest = "tmp/" + url.replace(/\/|\.|\?|\=|\&|\%/g, "_").replace(/\:/g, "") + ".png";

  if(url) {
    console.log("phantomjs", ["phantomjs/rasterize.js", url, dest])
    var p = exec("phantomjs", ["phantomjs/rasterize.js", url, dest]);
    p.stdout.pipe(process.stdout);
    p.stderr.pipe(process.stderr);
    p.on("close", function () {
      res.writeHead(200, {
          'Content-Type': 'text/html' 
      });
      res.end('<img src="//localhost:8000/'+dest+'">')
    });
  }
  else {
      res.writeHead(404, {
          'Content-Type': 'text/html' 
      });
      res.end('<p>Pass a URL!</p>')
  }
});

app.listen(8003);