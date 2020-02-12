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

        let data = await Task.create(params)
        console.log(data)
        success(res, data, 201)
    }

    catch(err){
        error(res, err, 422)
    }
}