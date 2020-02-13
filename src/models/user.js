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
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    image: {
        type: String,
        optional: true
    },
    encrypted_password: {
        type: String,
        required: true
    }
}, {
    versionKey: false,
    timestamps: true,
}
)

class User extends mongoose.model('User', userSchema) {

    static register({ email, password, password_confirmation }) {
        return new Promise((resolve, reject) => {
            if (password !== password_confirmation) return reject('Password doesn\'t match')

            let encrypted_password = bcrypt.hashSync(password, 10)

            this.create({
                email, encrypted_password
            })
                .then(data => {
                    let token = jwt.sign({ _id: data.id }, process.env.JWT_SIGNATURE_KEY)
                    resolve({
                        id: data._id,
                        email: data.email,
                        token
                    })
                })
                .catch(err => {
                    reject(err)
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
                        email: data.email,
                        token: token
                    })
                })
        })
    }

    static updateNameAndImage(id, fullname, buffer) {

        return new Promise((resolve, reject) => {

            imagekit.upload({ file: buffer.toString('base64'), fileName: `IMG-${Date.now()}` })

                .then(url => {
                    this.updateOne({ _id: id }, { fullname: fullname.fullname, image: url.url })

                        .then(() => {
                            resolve({
                                id: id,
                                fullname: fullname.fullname,
                                image: url.url
                            })
                        })
                })

                .catch(err => {
                    reject(err)
                })
        })
    }

    // static updateData(id, data, buffer) {

    //     return new Promise((resolve, reject) => {
    //         console.log(data)
    //         imagekit.upload({ file: buffer.toString('base64'), fileName: `IMG-${Date.now()}` })
    //             .then(url => {
    //                 this.findByIdAndUpdate({ _id: id }, { fullname: data.fullname, email: data.email, image: url.url })

    //                     .then(() => {
    //                         resolve({
    //                             data: data,
    //                             image: url.url
    //                         })
    //                     })
    //             })

    //             .catch(err => {
    //                 reject(err)
    //             })
    //     })
    // }

    static updateData(id, data, buffer) {
        console.log(id, data, buffer)
        return new Promise((resolve, reject) => {
            if (buffer !== undefined) {
                imagekit.upload({ file: buffer.toString('base64'), fileName: `IMG-${Date.now()}` })
                    .then(url => {
                        this.findOne({ _id: id }, function (err, foundData) {
                            if (err) {
                                reject(err)
                            } else {
                                if (!foundData) {
                                    reject(err)
                                } else {
                                    if (data.fullname) {
                                        foundData.fullname = data.fullname;
                                    }

                                    if (data.email) {
                                        foundData.email = data.email;
                                    }

                                    if (buffer) {
                                        foundData.image = url.url
                                    }

                                    foundData.save(function (err, foundData) {
                                        if (err) {
                                            reject(err)
                                        } else {
                                            resolve({
                                                data: foundData
                                            })
                                        }
                                    })
                                }
                            }

                        })
                    })
            } else {
                this.findOne({ _id: id }, function (err, foundData) {
                    if (err) {
                        reject(err)
                    } else {
                        if (!foundData) {
                            reject(err)
                        } else {
                            if (data.fullname) {
                                foundData.fullname = data.fullname;
                            }

                            if (data.email) {
                                foundData.email = data.email;
                            }

                            foundData.save(function (err, foundData) {
                                if (err) {
                                    reject(err)
                                } else {
                                    resolve({
                                        data: foundData
                                    })
                                }
                            })
                        }
                    }

                })
            }
        })

    }

    // static updateData(req) {

    //     return new Promise((resolve, reject) => {

    //         var id = req.user._id
    //         // var fullname = req.body.fullname
    //         // var email = req.body.email
    //         var buffer = req.file.buffer

    //         imagekit.upload({ file: buffer.toString('base64'), fileName: `IMG-${Date.now()}` })

    //             .then(url => {
    //                 this.findOne({ _id: id }, function (err, foundData) {
    //                     if (err) {
    //                         reject(err)
    //                     } 
    //                     else {
    //                         if (!foundData) {
    //                             reject(err)
    //                         } else {
    //                             // console.log(data.fullname)
    //                             if (req.body.fullname) {
    //                                 foundData.fullname = req.body.fullname;
    //                             }

    //                             if (req.body.email) {
    //                                 console.log('hai5')
    //                                 foundData.email = req.body.email;
    //                             }

    //                             if (url) {
    //                                 console.log('hai6')
    //                                 foundData.image = url.url
    //                             }

    //                             foundData.save(function (err, foundData) {
    //                                 if (err) {
    //                                     reject(err)
    //                                 } else {
    //                                     resolve({
    //                                         data: foundData
    //                                     })
    //                                 }
    //                             })
    //                         }
    //                     }

    //                 })
    //             })
    //     })

    // }






}
module.exports = User;