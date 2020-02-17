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
const isEmpty = require('../helpers/isEmpty')
const translate = require('../helpers/translate')
require('mongoose-type-email')
mongoose.SchemaTypes.Email.defaults.message = 'Email address is invalid'

const userSchema = new Schema({
    fullname: {
        type: String,
        required: true,
        minlength: 4
    },
    email: {
        type: mongoose.SchemaTypes.Email,
        required: true,
        unique: true
    },
    image: {
        type: String,
        default: 'https://ik.imagekit.io/m1ke1magek1t/default_image/leopard-face-in-flat-design-vector-11455279_hjoC0R2gM.jpg'
    },
    encrypted_password: {
        type: String
    },
    language: {
        type: String,
        required: true,
        default: 'en'
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
                        language: data.language,
                        token: token
                    })
                })
                .catch(err => {
                    reject({
                        message: err.message
                    })
                })
        })
    }

    static login(user) {
        return new Promise((resolve, reject) => {
            this.findOne({ email: user.email })
                .then(async data => {

                    if (isEmpty(data)) {
                        return reject(await translate.translator('emailNotExist'))
                    }

                    let isPasswordValid = bcrypt.compareSync(user.password, data.encrypted_password)

                    if (!isPasswordValid) return reject('Email or Password is wrong')

                    let token = jwt.sign({ _id: data._id, language: data.language }, process.env.JWT_SIGNATURE_KEY)

                    resolve({
                        id: data._id,
                        fullname: data.fullname,
                        email: data.email,
                        token: token
                    })
                })
        })
    }

    static async updateData(id, req) {
        let params = {
            fullname: req.body.fullname,
            email: req.body.email,
            language: req.body.language
        }

        for (let prop in params) if (!params[prop]) delete params[prop];

        if (req.file) {
            let url = await imagekit.upload({ file: req.file.buffer.toString('base64'), fileName: `IMG-${Date.now()}` })
            params.image = url.url
        } else {
            params.image = 'https://ik.imagekit.io/m1ke1magek1t/IMG-1581942880589_40itSdhr0'
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


}

module.exports = User;