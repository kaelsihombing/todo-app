const express = require('express');
const router = express.Router();
const user = require('./controllers/userController')
const task = require('./controllers/taskController')

const authenticate = require('./middlewares/authenticate')
const multer = require('./middlewares/multer')

//=============USER-ROUTER
router.post('/users', user.create)
router.put('/users', multer, authenticate, user.updateData)
router.post('/auth/login', user.login)

//=============TASK-ROUTER
router.post('/tasks/create', authenticate, task.createTask);
router.get('/tasks/view', authenticate, task.viewTask);
router.put('/tasks/edit', authenticate, task.editTask);

module.exports = router;