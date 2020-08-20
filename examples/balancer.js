// A simple round-robin load balancer

var http = require('http'),
    httpProxy = require('http-proxy');

var addresses = [
    'http://localhost:8000',
    'http://localhost:8020',
];

var proxy = httpProxy.createProxyServer();

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
