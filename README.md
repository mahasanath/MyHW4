
#####HW #4 Deployment 
================

### Setup

* Clone the Deployment repo, and follow the instructions as shown in the workshop to deploy HW3 application (https://github.com/mahasanath/HW3Queue.git) using blue and green strategy.
* Install redis and run on localhost:6379 and localhost:6364. This can be achieved through change in config files and running each server instance.
* Run "node infrastructure.js" , the web application running is ServerInstance1.js. It runs at localhost:8001


##### Task 1: Complete git/hook setup     

> -w and --watchDir=deploy/blue-www/ are added to the 'exec' command to facilitate auto-deployment and refresh without having restarted the system. 

![watchDir](https://github.com/mahasanath/MyHW4/blob/master/snaps/exec_commands.png)


> Also, the hooks/post-receive file setup is a git/hookup setup.


##### Task 2: Create blue/green infrastructure:    

> HW3 application on deployment is in blue-www and green-www. Both are running on two different redis instances. The blue instance running on port number 5060 is connected to redis instance running on port number 6379 and green instance running on port number 9090 is connected to redis instance running on port number 6364. 

![Redis instances](https://github.com/mahasanath/MyHW4/blob/master/snaps/2_redis_instances.png)

> To enable traffic routing to blue infrastructure by default, change TARGET = GREEN to TARGET = BLUE in 'infrastructure.js' as shown below. 

![Blue--->green](https://github.com/mahasanath/MyHW4/blob/master/snaps/target.png)

##### Task 3: Demonstrate /switch route     

> for /switch, the http request's url is being checked and if the req.url = '/switch', the TARGET is switched to green from blue and vice versa depending on the current Target instance.

![](https://github.com/mahasanath/MyHW4/blob/master/snaps/switch.png)
   
##### Task 4: Migration of data on switch    

> On /switch, the images uploaded at one instance is copied to the other instance. Here, if Target is currently blue, 
the images stored in blue redis are copied to green redis instance as images. This causes the migration of data.

![](https://github.com/mahasanath/MyHW4/blob/master/snaps/meow.png) 

> To test this, upload is completed by running the following CURL command through command promt. Upload is implemented on green server using 5060.       

```
curl -F "image=@./img/morning.jpg" localhost:3001/upload  
   
```
> On /switch request, data is migrated and this can be checked by using /meow request. It displays the uploded image and removes that image from the queue.  

![](https://github.com/mahasanath/MyHW4/blob/master/snaps/meow_1.png)
    
##### Task 5: Demonstrate mirroring   

> It has the same functionality as above. In place of /switch request, if the mirroring flag is true, the same sequesnce of actions happen and the image is transferred.

