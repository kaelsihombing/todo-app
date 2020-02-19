const express = require('express');
const router = express.Router();
const user = require('./controllers/userController')
const task = require('./controllers/taskController')

const authenticate = require('./middlewares/authenticate')
const multer = require('./middlewares/multer')

const validateForm = require('./middlewares/validateForm')

//reset password
const {check} = require('express-validator');
const Password = require('./controllers/password')

//=============USER-ROUTER
router.post('/users', validateForm, user.create)
router.put('/users', multer, authenticate, user.updateData)
router.post('/auth/login', user.login)

//=============TASK-ROUTER
router.post('/tasks', authenticate, task.createTask);
router.get('/tasks/:page', authenticate, task.viewTask);
router.get('/tasks/sort/asc/:sort/:page', authenticate, task.sortTaskAsc);
router.get('/tasks/sort/desc/:sort/:page', authenticate, task.sortTaskDesc);
router.get('/tasks/filter/importance/:value/:page', authenticate, task.filterTaskImportance);
router.get('/tasks/filter/completion/:value/:page', authenticate, task.filterTaskCompletion);
router.put('/tasks/:id', authenticate, task.editTask);
router.delete('/tasks/:id', authenticate, task.deleteTask);

//=============Password RESET
router.post('/recover', [
    check('email').isEmail().withMessage('Enter a valid email address'),
], Password.recover);

router.get('/reset/:token', Password.reset);

router.post('/reset/:token', [
    check('password').not().isEmpty().isLength({ min: 6 }).withMessage('Must be at least 6 chars long'),
    check('confirmPassword', 'Passwords do not match').custom((value, { req }) => (value === req.body.password)),
], Password.resetPassword);

module.exports = router;