var http = require('http'),
httpProxy = require('http-proxy');
//
// A simple round-robin load balancing strategy.
// 
// First, list the servers you want to use in your rotation.
//
var addresses = [
  {
    host: 'localhost',
    port: 3001
  },
  {
    host: 'localhost',
    port: 3002
  }
];
var proxy = httpProxy.createServer();

http.createServer(function (req, res) {
  //
  // On each request, get the first location from the list...
  //
  var target = { target: addresses.shift() };
  console.log("requests redircted");
  console.log('balancing request to: ', target);
  proxy.web(req, res, target);
  //
  // ...and then the server you just used becomes the last item in the list.
  //
  addresses.push(target.target);
}).listen(80);