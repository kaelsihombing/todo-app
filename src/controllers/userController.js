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

// exports.updateData = async (req, res) => {
//     try {
//         if (req.file === undefined) {
//             let result = await User.updateData(req.user._id, req.body)
//             success(res, result, 201)
//         } else {
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
        let result = await User.updateData(req.user._id, req)
        success(res, result, 201)
    }
    catch (err) {
        error(res, err, 422)
    }
}
// exports.updateData = async (req, res) => {
//     try {
//         if (req.file) {
//             console.log('2')
//             let result = await User.updateData(req.user._id, req.body, req.file)
//             success(res, result, 201)

//         } else {
//             console.log('2')
//             let result = await User.updateData(req.user._id, req.body)
//             success(res, result, 201)
//         }
//     }
//     catch (err) {
//         error(res, err, 422)
//     }
// }