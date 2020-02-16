const Task = require('../models/task.js');
const {
    success,
    error,
} = require('../helpers/response.js');

exports.createTask = async (req, res) => {
    try {
        let result = await Task.newTask(req.body, req.user._id)
        success(res, result, 201)
    }
    catch (err) {
        error(res, err, 422)
    }
}

exports.viewTask = async (req, res) => {
    let result = await Task.findTask(req.user._id, req.query.page)
    success(res, result, 200)
}

exports.viewAllTask = async (req, res) => {
    let result = await Task.findAllTask(req.user._id)
    success(res, result, 200)
}

exports.sortTask = async (req, res) => {
    try {
        let result = await Task.sortTaskByParams(req.user._id, req.body, req.query.page)
        success(res, result, 200)
    }
    catch (err) {
        error(res, err, 422)
    }
}

exports.filterTask = async (req, res) => {
    try{
        let result = await Task.filterTaskByParams(req.user._id, req.body, req.query.page)
        success(res, result, 200)
    }
    catch (err) {
        error(res, err, 422)
    }
}

exports.editTask = async (req, res) => {
    try {
        let result = await Task.updateTask(req.query.id, req.body)
        success(res, result, 201)
    }
    catch (err) {
        error(res, err, 422)
    }
}

exports.deleteTask = async (req, res) => {
    try {
        let result = await Task.destroyTask(req.query.id)
        success(res, result, 200)
    }
    catch (err) {
        error(res, err, 422)
    }
}