# Create a Multi-Container Application with NodeJS and Redis

## Set up NodeJS applciaiton 
1. Create a root directory called _visits_ and then change directories to the newly created folder.
```s
mkdir visits
cd visits
```

2. Once inside the root directory we need to initate an node project and creating a file called _package.json_ which will host our app configuraiton. 

```s
npm init -y 
```

3. A file called `package.json` will have been created. We are going to now add 3 dependencies to our _package.json_ config file for our _visits_ to run. Those will be `nodemon`, `express`, & `redis`. To do this execute the following command: 

```s
npm i express nodemon redis --save
```

> NOTE: We are specifically using `redis:2.8.0` for this example. Ensure this is the dependency config in the _package.json_ file. 

4. Now we need to create an index.js file which will be the main program of our application. In it we will bring in our `express` package. We will use the express package in a variable called app to do a few things: 
    1. create a route 
    2. create a port for the app to listen for incoming requests. 
    3. create a client for our redis connection
    4. initiate a _visits_ counter and set to initial value of zero
    5. Create an incremental function that will parse the visits value to an int and increment on visits

```s
const express = require('express')
const redis = require('redis')
const app = express()

const PORT = 5001 || process.env.PORT
const client = redis.createClient()   //create the redis client
client.set('visits', 0)    // set initial value of visits to 0

app.get('/', (req, res) => {
    client.get('visits', (error, visits) => {
        res.send(`Number of visits is ${visits}`)
        client.set('visits', parseInt(visits) + 1)   // parseInt is use on visits to ensure it is a number not string
    })
})

app.listen(PORT, () => {
    console.log(`Server is up and listening on PORT ${PORT}`)
})
```

## Setup our Dockerfile

1. In our root directory, we want to create out Dockerfile

```s
code Dockerfile
```

2. In the Dockerfile we want to add our psuedo-code of 1. establish a base image, 2. Setup commands to run 3. set a startup command

```s
# Create a base image

# Run a series of commands

# Establish a startup command 
```

3. Now populate our Dockerfile with 1. a base image, 2. A working directory 3. our commands to include our cache optimizing strategy & 4. A startup command like this:

```s
# Create a base image
FROM node:14-alpine

# Create a Working Directory
WORKDIR /usr/app

# Run a series of commands
COPY ./package.json ./
RUN npm install
COPY ./ ./

# Establish a startup command 
CMD ["npm", "start"]
```

## Now lets Build the image 

1. Nav to the root directory
```s
cd ~/visits
```

2. Execute our build command, remember to include our tagging

```s
docker build -t rodriggj/visits:v1 .
```

Results in the following output

<p align="center">
<img width="350" src="https://user-images.githubusercontent.com/8760590/205516884-fdabdcc8-8005-430e-a0d8-a8858a823890.png"/>
</p>

3. With the build complete, lets run the image and create a container, remember to include port mapping to ensure http traffic can be forwarded to the container. 

```s
docker run -p 5001:5001 rodriggj/visits:v1
```

When we run the image you can see that the docker container does get instantiated, but you also see an error. This is because the container has no "redis" connection to connect too. 

<p align="center">
<img width="350" src="https://user-images.githubusercontent.com/8760590/205521884-585f9c26-5c82-4e39-becc-bec46bf2d6da.png"/>
</p>

<p align="center">
<img width="350" src="https://user-images.githubusercontent.com/8760590/205523129-08bd32d0-3001-421c-80bc-0bf149c6c0d7.png"/>
</p>

The node application cannot connect to the redis service hence the error. 

## Enter Docker Compose

In order to fix this particular issue we need to establish a connection from the `visits` application to the `redis` server running in another container. 

1. First we will retrieve the image for the redis container that we want to build. We do this via the run command: 

```s
docker run redis
```

And we get the following output:

<p align="center">
<img width="350" src="https://user-images.githubusercontent.com/8760590/205523202-2434cfbc-c384-488e-8ec4-1eb6eeb3aeaa.png"/>
</p>

2. Now we have a redis image running in one terminal session, open another terminal session and try running our `visits` container to see if they connect. 

```s
docker run -p 5001:5001 rodriggj/visits:v1
```

And when we do we can see that we still have the same error: 

<p align="center">
<img width="350" src="https://user-images.githubusercontent.com/8760590/205523392-f8fbab69-2d78-44ea-9ad1-6c3c4647e3b7.png"/>
</p>

So let's update our view diagram and see what we have to deal with now. 

<p align="center">
<img width="350" src="https://user-images.githubusercontent.com/8760590/205523485-c049f626-92de-4065-9861-5f6cc69f4f38.png"/>
</p>

We resolved creating the containers... but we still haven't connected them. 


