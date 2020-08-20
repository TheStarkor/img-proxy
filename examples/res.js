var http = require('http'),
    httpProxy = require('http-proxy');

var addresses = [
    'http://localhost:8000',
    'http://localhost:8020',
];

var proxy = httpProxy.createProxyServer();

proxy.on('proxyRes', function (proxyRes, req, res) {
    var body = [];
    proxyRes.on('data', function (chunk) {
        body.push(chunk);
    });
    proxyRes.on('end', function () {
        body = Buffer.concat(body).toString();
        console.log("res from proxied server:", body);
        if (body.indexOf("hello") != -1)
            res.end("my response to cli");
    });
});

http.createServer(function (req, res) {

  var target = { target: addresses.shift() };
  console.log('balancing request to: ', target);

  proxy.web(req, res, target);

  addresses.push(target.target);
}).listen(8021);


// test server
http.createServer(function (req, res) {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.write('request successfully proxied to: ' + req.url + '\n' + JSON.stringify(req.headers, true, 2));
    res.end('hello');
}).listen(8000);
  
http.createServer(function (req, res) {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.write('request successfully proxied to: ' + req.url + '\n' + JSON.stringify(req.headers, true, 2));
    res.end();
}).listen(8020);
