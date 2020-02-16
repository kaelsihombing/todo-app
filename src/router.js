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
router.get('/tasks/view/:page', authenticate, task.viewTask);
router.get('/tasks/viewall', authenticate, task.viewAllTask);
router.get('/tasks/filter/:page', authenticate, task.filterTask);
router.get('/tasks/sort/:page', authenticate, task.sortTask);
router.put('/tasks/edit/:_id', authenticate, task.editTask);
router.delete('/tasks/delete/:_id', authenticate, task.deleteTask);

module.exports = router;