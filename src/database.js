const mongoose = require('mongoose')

const dbConnectionString = {
    development: process.env.DB_CONNECTION,
    test: process.env.DB_CONNECTION_TEST,
    staging: process.env.DB_CONNECTION_STAGGING,
    production: process.env.DB_CONNECTION_PRODUCTION
}

mongoose.connect(
    dbConnectionString[process.env.NODE_ENV || 'development'],
    {
        useNewUrlParser: true,
        useCreateIndex: true,
        useUnifiedTopology: true
    }
)
    .then(() => {
        console.log(`Database Connected`)
    })
    .catch(() => {
        process.exit(1)
    })
