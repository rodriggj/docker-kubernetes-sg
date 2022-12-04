const express = require('express')
const app = express() 
const PORT = 3000 || process.env.PORT

app.get('/', (req, res) => {
    // res.send('Hi there')
    res.send('Bye there')
})

app.listen(PORT, ()=> {
    console.log(`Server is up and listening on port ${PORT}`)
})