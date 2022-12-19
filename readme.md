# Section 9 - Dockerizing Multiple Containers

## Objectives

## Steps
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
RUN npm install
COPY . .
CMD ["npm", "run", "start"]
```

4. Navigate to our `/complex/client` directory and execute a `docker build` command on the file `Dockerfile.dev`. 

```s
cd ~/complex/client
docker build -f Dockerfile.dev .
```

> NOTE: Make sure your Docker Desktop client is running to enable communication to the Docker Dameon. 

## References
