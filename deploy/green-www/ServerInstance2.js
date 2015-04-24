var redis = require('redis')
var multer  = require('multer')
var express = require('express')
var fs      = require('fs')
var app = express()
// REDIS
var client = redis.createClient(6379, '127.0.0.1', {})

///////////// WEB ROUTES

// Add hook to make it easier to get all visited URLS.
app.use(function(req, res, next)
{
	console.log(req.method, req.url);
	
	client.lpush("history",req.url);
	client.ltrim("history",0,4);
	

	next(); // Passing the request to the next handler in the stack.
});

app.get('/', function(req, res) {
	console.log("request made by host :" + req.get('host'));
	client.lpush("history",req.url);
	res.send('Server now in port 3002')
})


app.get('/get',function(req,res){
	client.get("key",function(err,value){
	res.send(value)
})

})

app.get('/set',function(req,res){
	client.set("key", "this message will destruct in 10 sec");
	client.expire("key",10);
	res.send('Success!! - Value added for the key in redis on port 3002');
})


app.get('/recent',function(req,res){
	console.log("request made by host :" + req.get('host'));
	client.lrange("history",0,-1,function(err,value){
	console.log("Recently Visited sites :");
	value.forEach(function(value){
		console.log(value)
	})
	res.send(value);
	
})
});

/*app.get('/recent',function(req,res){
	console.log("Recently Visited sites :");
	client.lrange("history",0,-1,function(err,value){
		value.forEach(function(value){
		console.log(value)
	})
	res.send(value);
})
});
*/

app.post('/upload',[ multer({ dest: './uploads/'}), function(req, res){
   console.log("request made by host :" + req.get('host'));
   console.log(req.body) // form fields
   console.log(req.files) // form files
   console.log(req.files.image.path)
   if( req.files.image )
   {
	   fs.readFile( req.files.image.path, function (err, data) {
	  		if (err) throw err;
	  		var img = new Buffer(data).toString('base64');
	  		console.log(img);
			client.lpush('images',img);
				
		}); 
	}

    res.status(204).end()
 }]);

app.get('/meow', function(req, res) {
		console.log("request made by host :" + req.get('host'));
		client.lpop('images',function(err,imagedata){

			if (err) res.send('')

			res.writeHead(200, {'content-type':'text/html'});
			//items.forEach(function (imagedata)
			//{
				res.write("<h1>\n<img src='data:hairypotter.jpg;base64,"+imagedata+"'/>");
			//});
			res.end();

		})
})

// HTTP SERVER
var server = app.listen(3002, function () {

	  var host = server.address().address
	  var port = server.address().port
	  client.lpush("vistedSites",3002)
   	  console.log('Additional server app listening at http://%s:%s', host, port)
})


