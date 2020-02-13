const express = require('express');
const router = express.Router();
const user = require('./controllers/userController')
const task = require('./controllers/taskController')

const authenticate = require('./middlewares/authenticate')
const multer = require('./middlewares/multer')

//=============USER-ROUTER
router.post('/users/register', user.create)
router.post('/users/login', user.login)
router.put('/users/update', multer, authenticate, user.updateData)

//=============TASK-ROUTER
router.post('/tasks/create', authenticate, task.createTask);
router.get('/tasks/view', authenticate, task.viewTask);
router.put('/tasks/edit', authenticate, task.editTask);

module.exports = router;