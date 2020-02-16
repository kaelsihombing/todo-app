const mongoose = require('mongoose')
const Schema = mongoose.Schema
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Imagekit = require('imagekit')
const imagekit = new Imagekit({
    publicKey: process.env.publicKey,
    privateKey: process.env.privateKey,
    urlEndpoint: process.env.urlEndpoint
})

const userSchema = new Schema({
    fullname: {
        type: String,
        required: true,
        minlength: 4
    },
    email: {
        type: String,
        required: true,
        unique: true,
        minlength: 4
    },
    image: {
        type: String,
        optional: true,
    },
    encrypted_password: {
        type: String,
        required: true,
    }
}, {
    versionKey: false,
    timestamps: true,
}
)

class User extends mongoose.model('User', userSchema) {
    static register({ fullname, email, password, password_confirmation }) {
        return new Promise((resolve, reject) => {

            if (password !== password_confirmation) return reject('Password and Password Confirmation doesn\'t match')

            let encrypted_password = bcrypt.hashSync(password, 10)

            this.create({
                fullname, email, encrypted_password
            })
                .then(data => {
                    let token = jwt.sign({ _id: data.id }, process.env.JWT_SIGNATURE_KEY)
                    resolve({
                        id: data._id,
                        fullname: data.fullname,
                        email: data.email,
                        token: token
                    })
                })
                .catch(() => {
                    reject({
                        message: "Please fill the form"
                    })
                })
        })
    }

    static login({ email, password }) {
        return new Promise((resolve, reject) => {
            this.findOne({ email })
                .then(data => {
                    if (!data) return reject('Email doesn\'t exist')

                    let isPasswordValid = bcrypt.compareSync(password, data.encrypted_password)

                    if (!isPasswordValid) return reject('Password is wrong')

                    let token = jwt.sign({ _id: data._id }, process.env.JWT_SIGNATURE_KEY)

                    resolve({
                        id: data._id,
                        fullname: data.fullname,
                        email: data.email,
                        token: token
                    })
                })
        })
    }


    // static updateData(id, data, buffer) {
    //     return new Promise((resolve, reject) => {
    //         if (buffer !== undefined) {
    //             imagekit.upload({ file: buffer.toString('base64'), fileName: `IMG-${Date.now()}` })
    //                 .then(url => {
    //                     this.findOne({ _id: id }, function (err, foundData) {
    //                         if (err) {
    //                             reject(err)
    //                         } else {
    //                             if (!foundData) {
    //                                 reject(err)
    //                             } else {
    //                                 if (data.fullname) {
    //                                     foundData.fullname = data.fullname;
    //                                 }

    //                                 if (data.email) {
    //                                     foundData.email = data.email;
    //                                 }

    //                                 if (buffer) {
    //                                     foundData.image = url.url
    //                                 }

    //                                 foundData.save(function (err, foundData) {
    //                                     if (err) {
    //                                         reject(err)
    //                                     } else {
    //                                         resolve({
    //                                             data: foundData
    //                                         })
    //                                     }
    //                                 })
    //                             }
    //                         }

    //                     })
    //                 })
    //         } else {
    //             this.findOne({ _id: id }, function (err, foundData) {
    //                 if (err) {
    //                     reject(err)
    //                 } else {
    //                     if (!foundData) {
    //                         reject(err)
    //                     } else {
    //                         if (data.fullname) {
    //                             foundData.fullname = data.fullname;
    //                         }

    //                         if (data.email) {
    //                             foundData.email = data.email;
    //                         }

    //                         foundData.save(function (err, foundData) {
    //                             if (err) {
    //                                 reject(err)
    //                             } else {
    //                                 resolve({
    //                                     data: foundData
    //                                 })
    //                             }
    //                         })
    //                     }
    //                 }

    //             })
    //         }
    //     })

    // }

    // static updateData(id, req) {
    //     return new Promise((resolve, reject) => {
    //         if (req.file !== undefined) {
    //             imagekit.upload({ file: req.file.buffer.toString('base64'), fileName: `IMG-${Date.now()}` })
    //                 .then(url => {
    //                     let params = {
    //                         fullname: req.body.fullname,
    //                         email: req.body.email,
    //                         image: url.url
    //                     }
    //                     for (let prop in params) if (!params[prop]) delete params[prop];
    //                     this.findByIdAndUpdate(id, params, { new: true })
    //                         .then(data => {
    //                             resolve(data)
    //                         })
    //                         .catch(err => {
    //                             reject(err)
    //                         })
    //                 })
    //         } else {
    //             let params = {
    //                 fullname: req.body.fullname,
    //                 email: req.body.email,
    //             }
    //             for (let prop in params) if (!params[prop]) delete params[prop];
    //             this.findByIdAndUpdate(id, params, { new: true })
    //                 .then(data => {
    //                     resolve(data)
    //                 })
    //                 .catch(err => {
    //                     reject(err)
    //                 })
    //         }
    //     })

    // }




    static async updateData(id, req) {
        let params = {
            fullname: req.body.fullname,
            email: req.body.email
        }

        for (let prop in params) if (!params[prop]) delete params[prop];
        
        if (req.file) {
            let url = await imagekit.upload({ file: req.file.buffer.toString('base64'), fileName: `IMG-${Date.now()}` })
            params.image = url.url
        }
        
        return new Promise((resolve, reject) => {
            this.findByIdAndUpdate(id, params, { new: true })
                .then(data => {
                    resolve(data)
                })
                .catch(err => {
                    reject(err)
                })
        })

    }

    // static updateData(id, data, image) {
    //     return new Promise((resolve, reject) => {
    //         if (image) {
    //             imagekit.upload({ file: image.buffer.toString('base64'), fileName: `IMG-${Date.now()}` })
    //                 .then(url => {
    //                     console.log(url)
    //                     this.findByIdAndUpdate(id, {
    //                         fullname: data.fullname,
    //                         email: data.email,
    //                         image: url.url
    //                     })
    //                     resolve(data)
    //                 })
    //                 .catch(err => {
    //                     reject(err)
    //                 })
    //         }
    //         else {
    //             this.findByIdAndUpdate(id, {
    //                 fullname: data.fullname,
    //                 email: data.email,
    //             })
    //         }
    //     })
    // }
}

module.exports = User;