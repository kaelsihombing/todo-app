const User = require('../models/user')
const {
    success,
    error,
} = require('../helpers/response')

exports.create = async (req, res) => {
    try {
        let result = await User.register(req.body)
        success(res, result, 201)
    }
    catch (err) {
        error(res, err, 422)
    }
}

exports.login = async (req, res) => {
    try {
        let result = await User.login(req.body)
        success(res, result, 200)
    }
    catch (err) {
        error(res, err, 422)
    }
}

exports.updateNameAndImage = async (req, res) => {
    try {
        // console.log(req.body, req.user._id, req.file.buffer)
        let result = await User.updateNameAndImage(req.user._id, req.body, req.file.buffer)
        success(res, result, 201)
    }
    catch (err) {
        error(res, err, 422)
    }
}

// exports.updateData = async (req, res) => {
//     try {
//         if (req.file === undefined) {
//             console.log('pertama')
//             let result = await User.updateData(req.user._id, req.body)
//             console.log('pertama-success')
//             success(res, result, 201)
//         } else {
//             console.log('kedua')
//             let result = await User.updateData(req.user._id, req.body, req.file.buffer)
//             success(res, result, 201)
//         }
//     }
//     catch (err) {
//         error(res, err, 422)
//     }
// }

exports.updateData = async (req, res) => {
    try {
        let result = await User.updateData(req)
        success(res, result, 201)
    }
    catch (err) {
        error(res, err, 422)
    }
}