# Section 9 - Dockerizing a multi-container app

## Objective

## Steps

### Containerizing the `client` application

1. In Section 8, we created a directory structure complete with the appropriate files to build a React Application that will perform fibinocci calculations. The application will utilize a _Redis_, _Postgres_, _Express_, and _React_ architecture, and we will now `dockerize` these various components. 

2. We will begin by creating a `Dockerfile.dev` file inside of our `client` directory that will be used to init the containerization of our React Client.

```s
cd ~/complex/client
code Dockerfile.dev
```

3. Input the following code into the `Dockerfile.dev` file. 

```s
FROM node:16-alpine
WORKDIR '/app'
COPY ./package.json ./
RUN npm i --save
COPY . .
CMD ["npm", "run", "start"]
```

4. Navigate to our `/complex/client` directory and execute a `docker build` command on the file `Dockerfile.dev`. 

```s
cd ~/complex/client
docker build -f Dockerfile.dev .
```

> NOTE: Make sure your Docker Desktop client is running to enable communication to the Docker Dameon. 

You should see a terminal display similar to the following 

<p align="center">
<img width="350" src="https://user-images.githubusercontent.com/8760590/207473370-0c2453fe-b748-4c53-8f32-21bb8b287f49.png">
</p>

5. Now utilize the Docker image id to run the container. 

```s
docker run sha256:541f4de7fd66d8c00c04d7246a3385e56c7e30900f92069983cad397e3ce310b
```

Should result in a display like this: 

<p align="center">
<img width="350" src="https://user-images.githubusercontent.com/8760590/207473539-7b2300df-865e-407f-9787-185e4d5b0c87.png">
</p>

### Containerizng the `server` application

1. Change directory to the `server` dir and build another docker file 

```s
code Dockerfile.dev
```

2. Enter the following in the docker file 

```s
FROM node:14.14.0-alpine

WORKDIR "/app"

COPY ./package.json ./

RUN npm i --save

COPY . . 

CMD ["npm", "run", "dev"]
```

3. Build an image out of this Dockerfile

```s
docker build -t rodriggj/server:v1 -f Dockerfile.dev .
```

4. Run the image

```s
docker run rodriggj/server:v1
```

### Containerizing the `worker` application

1. Change directory to the `server` dir and build another docker file 

```s
code Dockerfile.dev
```

2. Enter the following in the docker file 

```s
FROM node:14.14.0-alpine

WORKDIR "/app"

COPY ./package.json ./

RUN npm i --save

COPY . . 

CMD ["npm", "run", "dev"]
```

3. Build an image out of this Dockerfile

```s
docker build -t rodriggj/server:v1 -f Dockerfile.dev .
```

4. Run the image

```s
docker run rodriggj/server:v1
```

## Writing our Docker Compose file

When we write our `Docker Compose` file to help execute our Docker run tasks & establish a network upon which these containers can communicate with each other, we will have to consider the following within the Docker Compose file. 

<p align="center">
<img width="350" alt="image" src="https://user-images.githubusercontent.com/8760590/208468802-502edae6-3cc0-47dd-8849-f81f77a13c19.png">
</p>

1. Inside of the root project directory you want to create a `Docker Compose` file. 

```s
code docker-compose.yml
```

2. Begin to construct the `docker-compose.yml` file as follows: 

```yml
# Use postgres/example user/password credentials
version: '3.1'

services:
  postgres:
    image: postgres
    restart: always
    environment:
      POSTGRES_PASSWORD: example
```

> **NOTE:** Postgres image documentation is [here](https://hub.docker.com/_/postgres)

If we test this config we can run 
```s
docker compose up 
```
And you'll see that the postgres service has been initialized and ready to accept connections. 

3. We can now repeat the process for adding `redis` to our docker-compose file. 

```s
version: '3.1'

services:
  postgres:
    image: postgres
    restart: always
    environment:
      POSTGRES_PASSWORD: example
  redis: 
    image: redis:latest
```

Again if we want to test the config we can once again run `docker compose up` and validate that both the postgres service and now the ready service are ready to accept connections. 

4. Next we need to add our server config to the docker compose file. To do this we will add both a `build/context` and a `volume` so we can store files and interact with files from our local env to our container. To do this we will first add: 

```yaml
version: '3.1'

services:
  postgres:
    image: postgres
    restart: always
    environment:
      POSTGRES_PASSWORD: example
  redis: 
    image: redis:latest
  server: 
    build: 
      dockerfile: Dockerfile.dev
      context: ./server
```

> **NOTE:** Here what we are doing is using the `build` node to specify 2 things: 1. the dockerfile we want to build our image from which is specified in the `dockerfile` node. 2. We need to specify the build context, aka the path to the folder we are referencing to house the dockerfile which in this case is the server directory. 

5. Next we need to add our volumes so we can make changes to the files hosted on the server and to store files. For this we enter: 
```yml 
version: '3.1'

services:
  postgres:
    image: postgres
    restart: always
    environment:
      POSTGRES_PASSWORD: example
  redis: 
    image: redis:latest
  server: 
    build: 
      dockerfile: Dockerfile.dev
      context: ./server
    volumes: 
      - /app/node_modules
      - ./server:/app
```

> **NOTE:** Here we are specifying a volume with the `volume` node. Then we give the first arg in the array ('-') a folder to **NOT** Overwrite that is the `/app/node_modules` folder. Recall that we specified `/app` as our `WORKDIR` so when files get placed in this `/app/node_modules` folder at container build time, we want to **NOT** override this folder. Then we specify the _from_:_to_ directories we want to map our local storage to our container storage. We do so with a ":" notation in between 2 file paths. The first is where are the files coming from, in this case the root directory of `server` and we want them to map to our `WORKDIR` which happens to be `app` on our container. 

6. Now we need to specify the environment variables for our redis & postgres services. To do this we need to enter the following: 

```yaml 
version: '3'

services:
  postgres:
    image: postgres
    restart: always
    environment:
      POSTGRES_PASSWORD: example
  redis: 
    image: redis:latest
  server: 
    build: 
      dockerfile: Dockerfile.dev
      context: ./server
    volumes: 
      - /app/node_modules
      - ./server:/app
    environment:  
      - REDIS_HOST=redis
      - REDIS_PORT=6379
      - PGUSER=postgres
      - PGHOST=postgres
      - PGDATABASE=postgres
      - PGPASSWORD=POSTGRES_PASSWORD
      - PGPORT=5432
```

7. So now we have the postgres, redis, and server components all working together. Our final components of our build are the react client application as well as the Worker. To add this, enter the following in our .yml file. 

```yml
client: 
  build: 
    dockerfile: Dockerfile.dev
    context: ./client
  volumes: 
    - ./app/node_modules
    - ./client:/app
worker:
    build:
      dockerfile: Dockerfile.dev
      context: ./worker
    volumes:
      - /app/node_modules
      - ./worker:/app
    environment:
      - REDIS_HOST=redis
      - REDIS_PORT=6379
```

## Nginx Container 

Recall we said that this would be our application architecture 

<p align="center">
<img width="350" alt="image" src="https://user-images.githubusercontent.com/8760590/208481350-b1d6acce-da08-40d1-8d49-5b4c7f9a28be.png">
</p>

But we didn't account for our NGINX server. Where is this and why do we need it? 

Recall that we have 2 different types of routes within our architecture. There are some that follow a '/' nomenclature found in our `React` appliction, and there are some that will route to our `Express` application and the NGINX server will act as our load balancer directing traffic to the appropriate source.

<p align="center">
<img width="350" alt="image" src="https://user-images.githubusercontent.com/8760590/208482996-365da966-5fec-4568-ab09-4d9bc3d0d5e8.png">
</p>

To do this we will build a default.conf file for the nginx server that will manage the following: 

<p align="center">
<img width="350" alt="image" src="https://user-images.githubusercontent.com/8760590/208484179-6d5b648e-789e-4605-b824-2315b1dca8cd.png">
</p>

1. Create a dir called 'nginx'

```s
mkdir nginx
```

2. In the nginx folder create a file called 'default.conf'
```s
code default.conf
```

3. We will begin by creating our 'upstream' client calls. In the 'default.conf' file enter the following code: 

```s
upstream client {
  server client: 3000;
}

upstream api {
  server api: 50001
}
```

> **NOTE:** The syntax above is a nginx specific syntax that can be found in documentation sets [here](http://nginx.org/en/docs/http/ngx_http_upstream_module.html). Here we are using an upstream 'directive' and naming the upstream asset 'client'. We've then specified to the nginx engine that the upstream 'client' is listening on port 3000. 

> **NOTE:** Because our second service 'api' is really referring to our 'server' service captured in our docker compose file, we'll change the docker-compose file to instead use the name 'api' vs 'server'. 

<p align="center">
<img width="350" alt="image" src="https://user-images.githubusercontent.com/8760590/208928345-d575b22e-9369-4e47-b250-99bbf2df316a.png">
</p>

3. Now in our 'default.conf' file we will set up our nginx server with a code block that will listen on port 80, and redirect traffic to our '/' (react server) or '/api' (express server). 

```s
upstream client {
  server client: 3000;
}

upstream api {
  server api: 50001;
}

server {
    listen 80;

    location / {
        proxy_pass http://client; 
    }

    location /api {
        proxy_pass http://api;
    }
}
```

4. Now the last piece of config in our 'default.conf' file will be to ensure that when a route comes in with '/api' that nginx drops this prefix and simply routes to the remainder of the route path. For example... when a route hits '/api/values' we don't want to pass '/api' prefix to the express server we simply want to pass '/values'. So to drop this prefix we need to add this last piece of configuration. 

```s
upstream client {
  server client: 3000;
}

upstream api {
  server api: 50001;
}

server {
    listen 80;

    location / {
        proxy_pass http://client; 
    }

    location /api {
        rewrite /api/(.*) /$1 break; 
        proxy_pass http://api;
    }
}
```



## Reference