var http = require('http');
var url = require('url');
var fs = require('fs');
var mime = require('mime');
var httpProxy = require('http-proxy');
var cv = require('opencv');

var proxy = httpProxy.createServer({
    target:'http://localhost:9005'
});
  
proxy.listen(8005);

proxy.on('proxyRes', function (proxyRes, req, res) {
    var body = [];
    proxyRes.on('data', function (chunk) {
        body.push(chunk);
    });
    proxyRes.on('end', function () {
        fs.writeFile('./res/logo.png', body[0], 'binary', function(err){
            if (err) throw err
            console.log('File saved.');

            cv.readImage('./res/logo.png', function (err, img) {
                if (err) throw err;
            
                let width = img.width();
                let height = img.height();
                if (width < 1 || height < 1) {
                  throw new Error('Image has no size');
                }
            
                img.convertGrayscale();
                img.gaussianBlur([3, 3]);
                console.log('after', img);

                img.save('./res/logo_new.png');

                console.log('after', img);
            })


            console.log("res from proxied server:", body);
            res.end(body);
        })
    });
});

var server = http.createServer(function(req, res){
    var parsedUrl = url.parse(req.url);
    var resource = parsedUrl.pathname;

    if (resource.indexOf('/img/') == 0){
        var imgPath = resource.substring(1);
        console.log('imgPath='+imgPath);

        var imgMime = mime.getType(imgPath);
        console.log('mime='+imgMime);

        fs.readFile(imgPath, function(error, data){
            if (error){
                res.writeHead(500, {'Content-Type':'text/html'});
                res.end('500 Internal Server Error'+error);
            } else {
                res.writeHead(200, {'Content-Type':imgMime});
                res.end(data);
            }
        });
    } else {
        res.writeHead(404, {'Content-Type':'text/html'});
        res.end('404 Page Not Found');
    }
});

server.listen(9005, function(){
    console.log('Server is running...');
});