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

## Reference