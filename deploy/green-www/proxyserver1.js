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

	// ... INSERT HERE.
	

	next(); // Passing the request to the next handler in the stack.
});



// Add a proxy funtion to proxy requests to ports 3001 and 3002 from 3000
function proxyServer(req,res){
	client.rpoplpush("vistedSites","redirectports",function(error,value){
		console.log(" redirected to port :" + value)
		res.redirect("http://localhost:"+value+req.url);
	});
	client.rpoplpush("redirectports","vistedSites")
}

app.get('/', function(req, res) {
  	proxyServer(req,res)
})

app.get('/set', function(req, res) {
  	proxyServer(req,res)
})

app.get('/get', function(req, res) {
  	proxyServer(req,res)
})


app.get('/meow', function(req, res) {
	proxyServer(req,res)
})

app.get('/recent', function(req, res) {
	proxyServer(req,res)
})


app.post('/upload',[ multer({ dest: './uploads/'}), function(req, res){
   console.log(req.body) // form fields
   console.log(req.files) // form files
   console.log(req.files.image.path)
   if( req.files.image )
   {
	   fs.readFile( req.files.image.path, function (err, data) {
	  		if (err) throw err;
	  		var img = new Buffer(data).toString('base64');
	  		//console.log(img);
			client.lpush('images',img);
				
		}); 
	}

    res.status(204).end()
 }]);


// HTTP SERVER
var server = app.listen(3000, function () {

  var host = server.address().address
  var port = server.address().port
	client.lpush("vistedSites",3000)
  console.log('Example app listening at http://%s:%s', host, port)
})