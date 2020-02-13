const Task = require('../models/task.js');
const {
    success,
    error,
} = require('../helpers/response.js');

exports.createTask = async (req, res) => {
    try{
        let params = {
            title: req.body.title,
            dueDate: req.body.dueDate,
            owner: req.user._id,
        }

        let result = await Task.newTask(params)
        success(res, result, 201)
    }

    catch(err){
        error(res, err, 422)
    }
}

exports.viewTask = async (req, res) => {
    try{
        let result = await Task.findTask(req.user._id)
        success(res, result, 200)
    }

    catch(err){
        error(res, err, 422)
    }
}

exports.editTask = async (req, res) => {
    try{
        let params = {
            title: req.body.title,
            dueDate: req.body.dueDate,
            importance: req.body.importance,
            completion: req.body.completion,
        }
        
        let result = await Task.updateTask(req.query.id,params)
        success(res, result, 201)
    }

    catch(err){
        error(res, err, 422)
    }
}