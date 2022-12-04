# Section 4: Making Real Projects with Docker

> Intent of Section 4 is to create a small NodeJs Application. Deploy it to a Docker conatainer. And then access the application that is running on the Docker container. 

## High Level Process 
1. Create a NodeJS App
2. Create a Dockerfile
3. Build an image from the Dockerfile
4. Run the image as a container
5. Connect to the web app via a browser


## Process
### 1. Create a NodeJS App

### 2. Create a Dockerfile
1. In the root directory create a file called `Dockerfile` with no extension
```s
touch Dockerfile

# if using VS code you can also run 
code Dockerfile
```

2. When the IDE renders the file, input the following psuedo-code into the Dockerfile
```s
# Specify a base image

# Specifiy the commands you want to run 

# Specify a Startup command you want to execute when the container starts
```

3. Now begin to populate your psuedo-code with actual code
```s
# Specify a base image
FROM alpine

# Specifiy the commands you want to run 
RUN npm install

# Specify a Startup command you want to execute when the container starts
CMD ["npm", "start"]
```

4. Now lets attempt to build the docker image using our build command and specifying the file (_build context_) to the Dockerfile
```s
docker build -t rodriggj/simpleapp:v1 .
```

5. When we run the build process we are presented with an error. This was purposely done to highlight the importance of 2 things: 1. the consideration of the base image and the versioning & 2. the relevance of the `WORKDIR` command that will follow. 

<p align="center">
<img width="350" src="chttps://user-images.githubusercontent.com/8760590/205499165-d22aebfd-43b6-4fca-81f5-15032036f00e.png"/>
</p>

6. The problem we are running into is that we are using the base image `alpine` which **DOES NOT** have _npm_ installed in the image on our file system snapshot. So to fix this we have 2 options: 
+ We can find a new base image that does have _npm_ configured on the base fs snapshot
+ We can use the current base image and add _npm_ using the `RUN` command

For this fix we will go find an image with npm installed on an alpine base image. To do this we can reference `Dockerhub` to look for something that may satisfy this requirement. 

```s
# In a browser nav to Docker Hub which is a repository for base images
https://hub.docker.com/
```

If you query the Dockerhub for _Node_ you will find a Node image, with an alpine version we can use for our base image. This will have npm installed and if we reference this image our build should work just fine. 

7. Update the Dockerfile to reference the `node:14-alpine` version. 
```s
# Specify the base image
FROM FROM node:14-alpine

# Specifiy the commands you want to run 
RUN npm install

# Specify a Startup command you want to execute when the container starts
CMD ["npm", "start"]
```

8. Attempt to rebuild the image

```s
docker build -t rodriggj/simpleapp:v1 .
```

Now when we see the console output we see the image successfully builds. There are a few new errors though. 

<p align="center">
<img width="350" src="https://user-images.githubusercontent.com/8760590/205499900-aa3b762c-9e54-41e8-ae41-6cf222b73db6.png"/>
</p>

These errors are attempting to reference files that node needs to execute the application we built. Specifically it needs to know where the `package.json` file is to know which dependencies to install. In our current dockerfile config we have not specified where this file is, hence the errors. 

9. So we need to copy the contents of our root directory and ensure they are available in our container for reference. To do this we need to add the `COPY` command with the appropriate build context (aka path) to access / place files. Update your Dockerfile as follows: 

```s
# Specify the base image
FROM FROM node:14-alpine

# Specifiy the commands you want to run 
COPY ./ ./
RUN npm install

# Specify a Startup command you want to execute when the container starts
CMD ["npm", "start"]
```

> NOTE: We are adding the copy command before running the npm install command. This is because the file that specifies the install dependencies is _package.json_. So we need to copy that _package.json_ file over to the container before running _npm install_.

10. Now run the buld command again. 

```s
docker build -t rodriggj/simpleapp:v1 .
```

Which now results in this view

<p align="center">
<img width="350" src="https://user-images.githubusercontent.com/8760590/205501301-99170216-3c09-4daa-bd15-b7d925f3cb69.png"/>
</p>

> NOTE: The red warnings here can be ignored. These are not errors but version capability warnings that do not effect the application or build process.

11. Now that the build process has successfully executed, we can now run our image and create a container with our simple-web-app displaying in a browser. Run the following command to do so: 

```s
docker run rodriggj/simpleapp:v1
```

This command results in the following being displayed to the console. 

<p align="center">
<img width="350" src="https://user-images.githubusercontent.com/8760590/205501503-893aba18-51df-4c31-b4a3-4293bf318316.png"/>
</p>

This means our application is successfully up and listening on port 8080. To verify this open a browser and lets see if we can access our application by pinging the 8080 port. If successfull we should get a response that says "Hi There" displayed in our browser. 

> NOTE: I have a Jenkins Server running on port 8080 that I want to keep, so I'm going to modify my port mapping for my node application to be port 3000 vs 8080. To do this, in the index.js file, modify the _PORT_ variable to 3000 vs. 8080. You will have to rebuild the docker image. Then run the image again. 

<p align="center">
<img width="350" src="https://user-images.githubusercontent.com/8760590/205501769-6627b7ce-a9ea-405d-868e-3fbf81c80000.png"/>
</p>

You can see when I pull up `localhost:3000` I have an error. Nothing is being rendered from the container. This is because we have not configured a port mapping from our localhost to the container. 

<p align="center">
<img width="350" src="https://user-images.githubusercontent.com/8760590/205501853-29747294-4f7b-4a34-9d1e-2b657007e376.png"/>
</p>

12. To address the port mapping we will have to add some additional parameters to our `docker run` command. Modify your docker run command as follows: 

```s
docker run -p 3000:3000 rodriggj/simpleapp:v1
```

> NOTE: It is convention to map a local host port to the same port in the container

> NOTE: the `-p` flag is specifying a port mapping. The "left" side of the mapping is the _host_ and the "right" side of the mapping is the _container_. So above we are saying, any traffic on localhost intended for PORT 3000, bind (aka map, aka forward) that request to the container on port 3000. 

13. The above command executes and renders the following to the terminal screen. 

https://user-images.githubusercontent.com/8760590/205502505-42fb1c73-8a88-4402-87f5-955f7dd3b3d0.png

Now lets go back to the browser and see if we can our node app is receiving the inbound request on port 3000. We will know if the browser renders the "Hi There" response we programmed into our Simple-Web-App. 

<p align="center">
<img width="350" src="https://user-images.githubusercontent.com/8760590/205502595-91257589-296e-4139-a35b-54458d05b805.png"/>
</p>

And it does. 

14. Now lets look at the contents of our running container. Here recall we have 2 choices to see inside the container where the one you choose is dependent on _whether the contianer is running or not_. 
+ If the container **IS RUNNING** we use the following command: 
```s
docker exec -it rodriggj/simpleapp:v1 sh
```
+ If the container **IS NOT RUNNING** we use the following command: 
```s
docker run rodriggj/simpleapp:v1 sh
```

> NOTE: in both cases we are using an Override command `sh`. This is overriding the default Startup command we placed in our Docker file which was to run the script "npm start" which references our _package.json_ file which executes the _nodemon index.js_ command.

Whichever of the 2 options above we choose, we see the contents of the container by executing the `sh`. So now if we run `ls` inside the container we see a list of the root directory contents

```s
ls 
```

Here we see that our `COPY` command from our Dockerfile worked successfully and brought over our _package.json_ file along with our _index.js_ file. 

<p align="center">
<img width="350" src="https://user-images.githubusercontent.com/8760590/205503255-3bacf02c-6124-4796-8ade-2b83d76203f5.png"/>
</p>

15. This is bad practice to simply copy all files into the root of the container, because there is a risk that you will run into naming conflicts and potentially overwrite files on the container that are needed in the root directory. Instead you want to have a nested working directory with your needed files that will not conflict with the root directory of the container. To do this we need to modify our Dockerfile and add a working directory command. 

```s
WORKDIR /usr/app
```

So your new Dockerfile should look like this: 

```s
# Specify the base image
FROM node:14-alpine

# Specify a working directory
WORKDIR /usr/app

# Specifiy the commands you want to run 
COPY ./ ./
RUN npm install

# Specify a Startup command you want to execute when the container starts
CMD ["npm", "start"]
```

> NOTE: You don't have to specify `/usr/app` on a linux dir box, we could have use `/var` or `/home`. But the point is to choose a safe fs location where you won't disrupt container functionality

> NOTE: When you specify your `WORKDIR` this becomes the reference that the COPY command uses for the destination folder. 

<p align="center">
<img width="350" src="https://user-images.githubusercontent.com/8760590/205504113-5ca1895d-825c-4945-a101-b6cf9679459a.png"/>
</p>

16. With these changes you will have to rebuild the image. Lets make this a v2 image. 

```s
docker build -t rodriggj/simpleapp:v2 .
```

<p align="center">
<img width="350" src="https://user-images.githubusercontent.com/8760590/205504401-871fba7e-c7b9-4cac-86a2-52294115e7bc.png"/>
</p>

Then you will have to re-run the image, don't forget your port mapping in the run command

```s
docker run -p 3000:3000 rodriggj/simpleapp:v2
```
<p align="center">
<img width="350" src="https://user-images.githubusercontent.com/8760590/205504457-71fdbea6-a1f1-480a-bd85-1b3368bfaa9c.png"/>
</p>

Now you can see that if I once again go back into my container using the `exec` and `sh` override command, I am immediately directed to my working directory of `/usr/app` and if I `ls` the contents of that directory I see all my working files needed for my node application. 

<p align="center">
<img width="350" src="https://user-images.githubusercontent.com/8760590/205504650-797dc027-a010-46dd-9198-d2252e929109.png"/>
</p>

17. The last change that we will make to this process will be an optimize step on the container build process. With the way the Dockerfile is written right now if we wanted to make a change to the node application we would have to copy all files and re-run the npm install process even if our nodejs change doesn't change any dependencies. 

This is very inefficient and if we get a bigger app with more dependencies to install the time to run npm install could get very long. Instead we only want to install once, and any subsequent change to files that don't affect the install process we will copy over as a seperate isolated step in our build process. 

To do this we can use 2 copy commands.
+ Once copy command needed to install dependencies from our _package.json_ file
+ Another copy command to bring over any files modified / created that have nothing to do with the install process

To do this we will modify our Dockerfile like so: 

```s
# Specify the base image
FROM node:14-alpine

# Specify a working directory
WORKDIR /usr/app

# Specifiy the commands you want to run 
COPY ./package.json ./
RUN npm install
COPY ./ ./

# Specify a Startup command you want to execute when the container starts
CMD ["npm", "start"]
```

> NOTE: Now when the container builds, the first copy command will enable the npm install command for any dependencies we need. The second COPY command will move any files like index.js that may have been changed to modify our application but **DO NOT** require the installation process to run -- making the contianer build process faster. 

18. After making these changes, once again we need to `build` and `run` the docker processes. 

```s
docker build -t rodriggj/simpleapp:v3 .
```

```s
docker run -p 3000:3000 rodriggj/simpleapp:v3
```

Now if we make a change in our application, for example instead of rendering "Hi There" we render "By There", which **DOES NOT** have any new dependencies, we will not have to run the install process again, making the build process much more efficient. 

<p align="center">
<img width="350" src="https://user-images.githubusercontent.com/8760590/205505445-a8d5122b-6f18-454f-85cb-c72c7f427a6e.png"/>
</p>

So if you run the build process again ... you can see that it is not executing the install step; it is using the cached version because the dependency mapping didn't change. 

<p align="center">
<img width="350" src="https://user-images.githubusercontent.com/8760590/205505732-92b7b287-6333-4255-8ddf-f7a95a1e90af.png"/>
</p>