const express = require('express')
const app = express()
const morgan = require('morgan')
const dotenv = require('dotenv')
dotenv.config()

//  initialize mongoose connection
require('./database')
const {
    notFound,
    serverError
} = require('./exceptionHandler')

//  express middleware
app.use(express.json())
app.use(express.urlencoded({ extended: false}))

//  use Logger
app.use(morgan('tiny'))
const router = require('./router')
app.use('/api/v1', router)

//  Root End Point
app.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        data: 'Welcome to api'
    })
})

//  Exception Handler
app.use(serverError)
app.use(notFound)

