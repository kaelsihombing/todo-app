const express = require('express');
const router = express.Router();
const user = require('./controllers/userController')
const task = require('./controllers/taskController')

const authenticate = require('./middlewares/authenticate')
const multer = require('./middlewares/multer')

//=============USER-ROUTER
<<<<<<< HEAD
router.post('/users/register', user.create)
router.post('/users/login', user.login)
router.put('/users/complete-data', multer, authenticate, user.updateNameAndImage)
router.put('/users/update', multer, authenticate, user.updateData)
=======
router.post('/users/register', user.create);
router.post('/users/login', user.login);


>>>>>>> ab3875de2d62de81f77a270ecffe74f50ea6f7cc

//=============TASK-ROUTER
router.post('/tasks/create', authenticate, task.createTask);
router.get('/tasks/view', authenticate, task.viewTask);
router.put('/tasks/edit', authenticate, task.editTask);

module.exports = router;