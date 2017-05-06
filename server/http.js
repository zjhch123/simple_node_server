module.exports = (function() {
  var http = require('http'),
      path = require('path'),
      fs   = require('fs'),
      url  = require('url');

  var root = path.resolve('.');

  return {
    start: function() {
      var ip = this.config.ip,
        port = this.config.port;
      var server = http.createServer(this.processRequest.bind(this));
      server.listen(port, function() {
        console.log('Static path: ' + root);
        console.log('Server start at: http://' + ip + ':' + port);
      });
    },
    processRequest: function(request, response) {
      var requestUrl = request.url;
      var pathname = decodeURI(url.parse(requestUrl).pathname);
      var ext = path.extname(pathname);

      if(ext === '' && !pathname.endsWith('/')) {
        pathname += '/';
        var redirect = 'http://' + request.headers.host + pathname;
        response.writeHead(301, {
          location: redirect
        });
        response.end();
        return;
      }
      var absolutePath = path.join(root, pathname);
        // 能到这步里面说明url都是/a/b/或者/a/b.xx形式的
      fs.exists(absolutePath, function(exists) {
        if(exists) {
          if(ext === '') {
            var html = '<head><meta charset="utf-8"></head>';
            var files = fs.readdirSync(absolutePath);
            for(var i = 0; i < files.length; i++) {
              html += '<div><a href="' + files[i] + '">' + files[i] + '</div>';
            }
            response.writeHead(200, {
              'Content-Type': 'text/html; charset=utf-8'
            });
            response.end(html);
            return;
          } else {
            var contentType = this.getContentType(ext);
            var stream = fs.createReadStream(absolutePath, 'utf-8');
            response.writeHead(200, {
              'Content-Type': contentType
            }),
            stream.pipe(response);
            return;
          }
        } else {
          response.writeHead(404, {
            'Content-Type': 'text/html; charset=utf-8'
          });
          response.end("您访问的资源不存在");
          return;
        }
      }.bind(this));
    },
    getContentType: function(ext) {
      var contentType = this.config.mine;
      if(contentType.hasOwnProperty(ext.substr(1))) {
        return contentType[ext.substr(1)] + "; charset=utf-8";
      } else {
        return contentType["default"];
      }
    },
    config: {
      ip: '127.0.0.1',
      port: 3000,
      mine: {
        html:"text/html",
        js:"text/javascript",
        css:"text/css",
        gif:"image/gif",
        jpg:"image/jpeg",
        png:"image/png",
        ico:"image/icon",
        txt:"text/plain",
        json:"application/json",
        svg: "image/svg+xml",
        default:"application/octet-stream"
      },
    },
  }
})()