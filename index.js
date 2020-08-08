const express = require('express')
const cors = require('cors')
const authRoute = require('./routes/auth')
const profileRoute = require('./routes/profile')
const projectRoute = require('./routes/projects')
const projectmedia = require('./routes/media')
require('dotenv').config()

//const login = require('./routes/login')
const app = express()


app.use(express.json())
app.use(cors())


app.use('/api/auth',authRoute)
app.use('/api/profile',profileRoute)
app.use('/api/project',projectRoute)
app.use('/api/media',projectmedia)

app.listen(process.env.PORT || 3000 ,()=>{console.log(`Listening on port: ${process.env.PORT || 3000}`)})