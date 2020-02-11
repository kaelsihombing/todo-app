const mongoose = require('mongoose')
const Schema = mongoose.Schema
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const userSchema = new Schema({
    fullname: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    image: {
        type: String,
        options: true
    },
    encrypted_password: {
        type: String,
        required: true
    }
})

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
                        token: token
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
}

module.exports = User;