
var http      = require('http');
var httpProxy = require('http-proxy');
var exec = require('child_process').exec;
var request = require("request");
var redis = require('redis');
var url = require('url');
//var piclist = [];
//var picqueue = [];
var mirroring = true;

var GREEN = 'http://127.0.0.1:5060';
var BLUE  = 'http://127.0.0.1:9090';

var bclient= redis.createClient(6379, '127.0.0.1', {})
var gclient = redis.createClient(6364, '127.0.0.1', {})

var TARGET = BLUE;

var infrastructure =
{
  setup: function()
  {
    // Proxy.
    
    var options = {};
    var proxy   = httpProxy.createProxyServer(options);

    var server  = http.createServer(function(req, res)
    {

	
	if((req.url == '/switch' && TARGET == GREEN) || (mirroring == true && TARGET == GREEN)) 
	{
	   
		
  			gclient.lrange('images',0, -1, function(err, reply){
			piclist = reply;
			for(var i=0; i<piclist.length; i++){
    			bclient.rpush(['images', piclist[i]], function(err,reply){

				});	
    		   	}
   	
    			});
    
			TARGET = BLUE;

			res.write("Green --> Blue");
			res.end();
		
    		}

	    else if((req.url == '/switch' && TARGET == BLUE) || (mirroring == true && TARGET == BLUE))


		{
    			bclient.lrange('images',0, -1, function(err, reply){
    			picqueue = reply;

    			for(var i=0; i<picqueue.length; i++){
    			gclient.rpush(['images', picqueue[i]], function(err,reply){

    				});	
  			}
   
			});
    
			TARGET = GREEN;
			res.write("Blue --> Green");
			res.end();
		   
		}	

				
	
	proxy.web( req, res, {target: TARGET } );
    });
    server.listen(8001);

    // Launch green slice
    exec('forever -w --watchDir=deploy/blue-www/ start deploy/blue-www/ServerInstance1.js 9090');
    console.log("blue slice");

    // Launch blue slice
    exec('forever -w --watchDir=deploy/green-www/ start deploy/green-www/ServerInstance1.js 5060');
    console.log("green slice");

//setTimeout
//var options = 
//{
//  url: "http://localhost:8080",
//};
//request(options, function (error, res, body) {

  },

  teardown: function()
  {
    exec('forever stopall', function()
    {
      console.log("infrastructure shutdown");
      process.exit();
    });
  },
}

infrastructure.setup();

// Make sure to clean up.
process.on('exit', function(){infrastructure.teardown();} );
process.on('SIGINT', function(){infrastructure.teardown();} );
process.on('uncaughtException', function(err){
//  console.log(err);
//  infrastructure.teardown();
} );
