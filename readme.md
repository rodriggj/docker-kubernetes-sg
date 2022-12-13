# Section 8 - Building a Multi-container Application

## Objective

The application we will be building is very simple but we are overcomplicating the architecture to include: 
- [ ] nginx server
- [ ] react & express servers
- [ ] redis 
- [ ] & postgres

This is purposely over complicated for the sake of demonstrating multiple containers working with each other. This archicture can absolutely be simplified, but again the point is to get an operational applciation and emphasize the use of mulitple containers interacting. 

The architecture will effectively be the following: 

### Development Flow

<p align="center">
<img width="350" src="https://user-images.githubusercontent.com/8760590/207156578-195c6977-f97e-40e0-9a2c-eeed0b9ac761.png">
</p>

1. The nginx server will serve as a "router" that will execute traffic routing either to the Front-End (React application) if the application is requesting an html or css file, but will route to the Express Server if just requesting data from our API.

2. Depending on the data that we are trying to retrieve from the backend (either a calculation, or simply a cache value) we will make an appropriate call to postgres or redis. 

The data flow will look something like this: 

<p align="center">
<img width="350" src="https://user-images.githubusercontent.com/8760590/207158401-1a6f945e-5028-46f7-b96f-75d186277578.png">
</p>

## Steps

### `Worker` Setup

1. First create a directory called `complex` to house our new _complex_ application an its associated parts. 

```s
mkdir complex 
cd complex
```

2. In the root directory, create a sub-directory called `worker` 

```s
mkdir worker
cd worker
```

3. Add a package.json file or simply create using `npm init`

```s
npm init -y
```

4. Install 2 dependencies 1. _redis client_ & 2. _nodemon_

```s
npm i redis nodemon --save
```

5. Open the package.json file and ensure there are 2 scripts in the file 1. _start_ & 2. _dev_

```json
{
  "name": "worker",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "start": "node index.js",
    "dev": "nodemon"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "dependencies": {
    "nodemon": "^2.0.20",
    "redis": "^4.5.1"
  }
}
```

6. Create a source file for our fib calculations in `index.js`

```s
code index.js
```

7. Also create a `keys.js` file which is where we will export our redis connection configuration. 

```s
code keys.js
```

8. On the `keys.js` file enter the following to export our variables that will house our PORT and HOST configuration to our Redis instance

```js
module.exports = {
    redisHost: process.env.REDIS_HOST,
    redisPort: process.env.REDIS_PORT
}
```

9. Now go over to the `index.js` file an input the following: 

```js
const keys = require('./keys');
const redis = require('redis');

const redisClient = redis.createClient({
  host: keys.redisHost,
  port: keys.redisPort,
  retry_strategy: () => 1000,
});
const sub = redisClient.duplicate();

function fib(index) {
  if (index < 2) return 1;
  return fib(index - 1) + fib(index - 2);
}

sub.on('message', (channel, message) => {
  redisClient.hset('values', message, fib(parseInt(message)));
});
sub.subscribe('insert');
```

-------

### The `Express Server` setup

1. Make a parent directory for the express server that is at the same hierarchy level as the `worker` directory. Name this directory `server`. 

```s
cd ~/complex
mkdir server
cd server
```

2. Again run the npm init program, which will create a package.json and node_modules folder. 

```s
npm init -y
```

3. Install dependencies for 1. cors, 2. express, 3. pg 4. nodemon 5. redis  

```s
npm i nodemon express cors pg redis --save
```

4. Add the start and dev scripts to the package.json file. 

```json
{
  "name": "server",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "start": "node index.js",
    "dev": "nodemon"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "dependencies": {
    "cors": "^2.8.5",
    "express": "^4.18.2",
    "nodemon": "^2.0.20",
    "pg": "^8.8.0",
    "redis": "^4.5.1"
  }
}
```

5. Create a `keys.js` file to house all our connection variables, and input the following code into the `keys.js` file.

```s
code keys.js
```

```js
module.exports = { 
    redisHost: process.env.REDIS_HOST, 
    redisPort: process.env.REDIS_PORT, 
    pgUser: process.env.PGUSER, 
    pgHost: process.env.PGHOST,
    pgDatabase: process.env.PGDATABASE,
    pgPassword: process.env.PGPASSWORD,
    pgPort: process.env.PGPORT
}
```

6. Now we need to configure the `express` app that will communicate with _Redis_, _Postgres_, & the _React_ servers. First we will start with the required config to connect to our Postgres instance and store the values that have been submitted. 

```s
code index.js
```

```js
const bodyParser = require('body-parser')
const cors = require('cors')

const app = express()
app.use(cors())
app.use(bodyParser.json())

// Postgres Client Setup
const { Pool } = require('pg')
const pgClient = new Pool ({
    user: keys.pgHost,
    host: keys.pgHost, 
    database: keys.pgDatabase,
    password: keys.pgPassword,
    port: keys.pgPort
})

pgClient.on("connect", (client) => {
    client
      .query("CREATE TABLE IF NOT EXISTS values (number INT)")
      .catch((err) => console.error(err));
  });
```

7. Now we can continue to modify the `index.js` code to connect to the _Redis_ instance. Recall that the _Redis_ db is a cache, that will temporarily store the values submitted and pass these to the worker node to calculate the fib values. The _Redis_ store will then store the calculated fib values for the _Express_ server to return to the React application. 

```js
// Redis Client Setup
const redis = require('redis')
const redisClient = redis.createClient({
    host: keys.redisHost,
    port: keys.redisPort, 
    retry_strategy: () => 1000
})

const redisPublisher = redisClient.duplicate()
```

8. Now we need to create some routes for the express application to route requests to and apply the appropriate logic in the application. 

```js

```
## References
