const express = require('express');
const router = express.Router();

const user = require('./controllers/userController')

// const authenticate = require('./middlewares/authenticate')

//=============USER-ROUTER
router.post('/users/register', user.create)
router.post('/users/login', user.login)



//=============TASK-ROUTER

module.exports = router;