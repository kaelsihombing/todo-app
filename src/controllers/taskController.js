const Task = require('../models/task.js');
const {
    success,
    error,
} = require('../helpers/response.js');

exports.createTask = async (req, res) => {
    try {
        let params = {
            title: req.body.title,
            dueDate: req.body.dueDate,
            importanceLevel: req.body.importanceLevel,
            owner: req.user._id,
        }
        // if (params.importanceLevel === 1) {
        //     params.importance = 'Low'
        // }
        // if (params.importanceLevel === 2) {
        //     params.importance = 'Normal'
        // }
        // if (params.importanceLevel === 3) {
        //     params.importance = 'High'
        // }

        let result = await Task.newTask(params)
        success(res, result, 201)
    }

    catch (err) {
        error(res, err, 422)
    }
}

exports.viewTask = async (req, res) => {
    let result = await Task.findTask(req.user._id)
    success(res, result, 200)
}

exports.editTask = async (req, res) => {
    try {
        let params = {
            title: req.body.title,
            dueDate: req.body.dueDate,
            importanceLevel: req.body.importanceLevel,
            completion: req.body.completion,
        }

        for (let prop in params) if (!params[prop]) delete params[prop];

        let result = await Task.updateTask(req.query.id, params)
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