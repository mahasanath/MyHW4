
HW #3 Proxies, Queues, Cache Fluency 
==============================

### Option 2 of Homework

### Setup

* Clone this repo, run `npm install`  ( to install any additional dependencies that are not present in node module).
* Install redis and run on localhost:6379
* Run `node main.js` , which includes the child processes for `ServerInstance1.js (3001), ServerInstance2.js(3002) and proxyHttp.js` (80)
* Additionally you can also run "node proxyserver1.js" to see how a port 3000 has been created as a proxy and it is used to redirect request received on its port to 3001 and 3002

> There are two server instances ServerInstance1.js, configured to run on port 3001 and ServerInstance2.js which runs on port 3002 ( additional server instance running) . A proxy is set up  on `port 80` using a `http-proxy` node module. It can be found in proxyHttp.js in the repository. So requests received on proxy port 80 would be relayed to port 3001 or 3002 based on round robin scheme. Another method has also been used to setup proxy on port 3000 to rely all requests to ports 3001 and 3002 in proxyserver1.js.  So a request made at http://localhost:3000/ would be redirected and serviced by either http://localhost:3001/ or http://localhost:3002/. 

##### Task 1: set and get     

> lpush and ltrim are added to the use command to facilitate storing of the desired history of visited URLs.

````
app.use(function(req, res, next)
{
	console.log(req.method, req.url);
	
	client.lpush("history",req.url);     // push urls to 'history'
	client.ltrim("history",0,4);         //use ltrim to shorten 'history'

	next(); // Passing the request to the next handler in the stack.
});
````

> /set is completed as follows, and the client.expire command is used to set timeout of 10 s for the key.

```
 app.get('/set',function(req,res){
	client.lpush("history",req.url);
	client.set("key", "this message will destruct in 10 sec");
	client.expire("key",10);
	res.send('Success!! - Value added for the key in redis on port 3001');
});
```
> /get is completed as follows: 

```
> app.get('/get',function(req,res){
	client.lpush("history",req.url);
	client.get("key",function(err,value){
	res.send(value)
})
})

res.send(value) sends back the value associated with the key in the request to the client
```      

##### Task 2: recent     

> /recent is completed as follows:   
It is implemented on server with port 3001 and 3002. It would list the most recently visisted sites. lpush, ltrim and lrange are used to display the desired history of visited URLs. The result is printed in the console output and also sent to the client on the following link:    

 * http://localhost:3001/recent	
 * http://localhost:3002/recent

```
app.get('/recent',function(req,res){
	client.lrange("history",0,-1,function(err,value){
	console.log("Recently Visited sites :");
	value.forEach(function(value){
		console.log(value)
	})
	res.send(value);
})
});
````   


##### Task 3: upload and meow     

> upload is completed by running the following CURL command through command promt. Upload is implemented on all three ports 3000,3001 and 3002. If uploaded to ports 3001 or 3002,      

```
curl -F "image=@./img/morning.jpg" localhost:3001/upload  
Visit 'meow' to test the "queue" functionality:   
	http://localhost:3001/meow   
```
> It displays the most recently uploded image and remove that image from the queue. Thus establishing the queue functionality.    
    
    
>  upload is completed as follows by adding lpush to push uploaded images to the queue.

```
	client.lpush('images',img);
```   
    
    
#### All tasks console output:    

![alltasks_console](https://github.com/mahasanath/HW3Queue/blob/master/screenshots/tasksConsole_get_set_recent_meow.PNG)   


##### Task 4: Additional service instance running    

> Additional service is completed by adding another server instance at 'port 3002'. This is run as a child process using main.js
 
> get, set, recent, upload and meow have been implemented in this server as well. Client requests can be made using    
"http://localhost:3002/". For example, http://localhost:3002/get

##### Task 5: Demonstrate proxy   

> Proxy is implemented in two ways. One method in which I have implemented proxy using "http-proxy" node module, proxy behaves as a load balancer. It redirects all requests on port 80 to either 3001 or 3002 using the round robin scheme. Sample code from simple-balancer.js from the http-proxy library has been used. The code is added to the repository as ProxyHtpp.js.   

![proxy](https://github.com/mahasanath/HW3Queue/blob/master/screenshots/proxy_host.PNG)

> Another method is using an other server instance running on port 3000 ( node proxyserver1.js ) which would relay client requests that it receives and redirects it to ports 3001 or 3002. 

> So for example, a upload on port 3000 has been made using the CURL command.  A meow request made on port 3000, http://localhost:3000/meow would be serviced by either http://localhost:3001/meow or http://localhost:3002/meow, thereby displaying the uploaded images and then removed from the queue.   

> proxy server is implemented using  "rpoplpush command" to toggle between ports and http 'redirect' is used to re-route the request.
