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