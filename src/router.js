const express = require('express');
const router = express.Router();
const user = require('./controllers/userController')
const task = require('./controllers/taskController')

const authenticate = require('./middlewares/authenticate')
const multer = require('./middlewares/multer')

const validateForm = require('./middlewares/validateForm')

//=============USER-ROUTER
router.post('/users', validateForm, user.create)
router.put('/users', multer, authenticate, user.updateData)
router.post('/auth/login', user.login)

//=============TASK-ROUTER
router.post('/tasks', authenticate, task.createTask);
router.get('/tasks/:page', authenticate, task.viewTask);
router.get('/tasksall', authenticate, task.viewAllTask);
router.get('/tasks/sort/asc/:sort/:page', authenticate, task.sortTaskAsc);
router.get('/tasks/sort/desc/:sort/:page', authenticate, task.sortTaskDesc);
router.get('/tasks/filter/importance/:value/:page', authenticate, task.filterTaskImportance);
router.get('/tasks/filter/completion/:value/:page', authenticate, task.filterTaskCompletion);
router.put('/tasks/:id', authenticate, task.editTask);
router.delete('/tasks/:id', authenticate, task.deleteTask);

module.exports = router;