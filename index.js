const express = require('express')
const authRoute = require('./routes/auth')
const profileRoute = require('./routes/profile')
require('dotenv').config()
//const login = require('./routes/login')
const app = express()


app.use(express.json())


app.use('/api/auth',authRoute)
app.use('/api/profile',profileRoute)

app.listen(process.env.PORT,()=>{console.log(`Listening on port: ${process.env.PORT}`)})