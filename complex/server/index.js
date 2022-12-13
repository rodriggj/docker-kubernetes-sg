const keys = require('./keys')

// Configure the Express App Setup 
const express = require('express')
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

// Redis Client Setup
const redis = require('redis')
const redisClient = redis.createClient({
    host: keys.redisHost,
    port: keys.redisPort, 
    retry_strategy: () => 1000
})

const redisPublisher = redisClient.duplicate()

// Configure Express Route Hanlders
app.get('/', (req, res) => {
    res.send('Hello from inside the Express App.')
})

app.get('/values/all', async (req, res) => {
    const values = await pgClient.query('SELECT * FROM values')

    res.send(values.rows)
})

app.get('/values/current', async (req, res) => {
    redisClient.hGetAll('values', (err, values) => {
        res.send(values)
    })
})

app.post('/values', async(req, res) => {
    const index = req.body.value
    
    if(parseInt(index) > 40) {
        return res.status(422).send('Index is too high.')
    }
    
    redisClient.hSet('values', index, 'Nothing yet...')
    redisPublisher.publish('insert', index)

    pgClient.query('INSERT INTO values(number) VALUES($1)', [index])

    res.send({working: true})
})

app.listen(5001, (err) => {
    if(!err){
        console.log('Server is up and listening on port 5000')
    }
    console.log(err)
})