const User = require('../models/user')
const {
    success,
    error,
} = require('../helpers/response')

exports.create = async(req, res) => {
    try {
        let result = await User.register(req.body) 
        success(res, result, 201)
    } 
    catch(err) {
        error(res, err, 422)
    }
}

exports.login = async(req, res) => {
    try {
        let result = await User.login(req.body)
        success(res, result, 200)
    }
    catch(err) {
        error(res, err, 422)
    }
}