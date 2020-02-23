const Task = require('../models/task.js');
const {
    success,
    error,
} = require('../helpers/response.js');

const translator = require('../helpers/translate').translator

exports.createTask = async (req, res) => {
    try {
        let result = await Task.newTask(req.body, req.user._id)
        success(res, result, 201, await translator('taskCreated', req))
    }
    catch (err) {
        error(res, err, 422)
    }
}

exports.viewTask = async (req, res) => {
    try {
        let result = await Task.findTask(req.user._id, req.query.page, req.query.pagination || true, req.query.importanceLevel || undefined, req.query.completion || undefined)
        success(res, result, 200)
    }
    catch (err) {
        error(res, err, 422)
    }
}

exports.sortTask = async (req, res) => {
    try{
        let result = await Task.findSortedTask(req.user._id, req.query.order, req.query.sort, req.query.page)
        success(res, result, 200)
    }
    catch (err) {
        error(res, err, 422)
    }
}

exports.filterTask = async (req, res) => {
    try {
        let result = await Task.findFilteredTask(req.user._id, req.query.filter, req.query.importanceLevel, req.query.completion, req.query.page)
        success(res, result, 200)
    }
    catch (err) {
        error(res, err, 422)
    }
}

exports.editTask = async (req, res) => {
    try {
        let result = await Task.updateTask(req.user._id, req.query.id, req.body)
        success(res, result, 201, await translator('taskEdited', req))
    }
    catch (err) {
        error(res, err, 422)
    }
}

exports.deleteTask = async (req, res) => {
    try {
        let result = await Task.destroyTask(req.user._id, req.query.id)
        success(res, result, 200)
    }
    catch (err) {
        error(res, err, 422)
    }
}

