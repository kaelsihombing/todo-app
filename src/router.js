const express = require('express');
const router = express.Router();
const user = require('./controllers/userController')
const task = require('./controllers/taskController')

const authenticate = require('./middlewares/authenticate')

//=============USER-ROUTER
router.post('/users/register', user.create)
router.post('/users/login', user.login)



//=============TASK-ROUTER
router.post('/tasks/create', authenticate, task.createTask)

module.exports = router;