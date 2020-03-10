const mongoose = require('mongoose')
const Schema = mongoose.Schema
const Task = require('./task')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const axios = require('axios')
const Imagekit = require('imagekit')
const imagekit = new Imagekit({
    publicKey: process.env.publicKey,
    privateKey: process.env.privateKey,
    urlEndpoint: process.env.urlEndpoint
})
const isEmpty = require('../helpers/isEmpty')
const Auth = require('../events/auth')

require('mongoose-type-email')
mongoose.SchemaTypes.Email.defaults.message = 'Email address is invalid'

const defaultImage = 'https://ik.imagekit.io/m1ke1magek1t/default_image/seal-face-in-flat-design-vector-17125367_P7kNTkQZV.jpg';

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
        default: defaultImage
    },

    encrypted_password: {
        type: String
    },

    language: {
        type: String,
        required: true,
        default: 'en'
    },

    resetPasswordToken: {
        type: String,
        required: false
    },

    resetPasswordExpires: {
        type: Date,
        required: false
    }
}, {
    versionKey: false,
    timestamps: true,
}
)

class User extends mongoose.model('User', userSchema) {

    static generatePasswordReset(id) {
        var resetPasswordToken = crypto.randomBytes(20).toString('hex');
        var resetPasswordExpires = Date.now() + 360000; // 6 minutes expired

        let properties = {
            resetPasswordToken: resetPasswordToken,
            resetPasswordExpires: resetPasswordExpires
        }

        return new Promise((resolve, reject) => {
            this.findByIdAndUpdate(id, properties, { new: true })
                .then(data => {
                    resolve(data)
                })
                .catch(err => {
                    reject(err)
                })
        })

    }

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
                        image: data.image,
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


    static login(req) {
        return new Promise((resolve, reject) => {
            this.findOne({ email: req.body.email })
                .then(async data => {

                    const translate = require('../helpers/translate').translator
                    if (isEmpty(data)) return reject(await translate("emailNotExist"))

                    if (bcrypt.compareSync(req.body.password, data.encrypted_password)) {
                        let token = jwt.sign({ _id: data._id, language: data.language }, process.env.JWT_SIGNATURE_KEY)
                        Auth.emit('authorized', data._id)

                        return resolve({
                            id: data._id,
                            fullname: data.fullname,
                            email: data.email,
                            image: data.image,
                            token: token
                        })
                    } else {
                        Auth.emit('unauthorized', {
                            _id: data._id,
                            email: req.body.email,
                            source: req.headers['who?']
                        })
                        return reject({
                            errors: 'Email or Password is wrong, please fill valid data.'
                        })
                    }
                })
        })
    }

    static async updateData(id, req) {
        console.log('ID: ', id);
        console.log('Body: ',req.body)
        let params = {
            fullname: req.body.fullname,
            language: req.body.language
        }
        
        for (let prop in params) if (!params[prop]) delete params[prop];
        if (req.file) {
            let url = await imagekit.upload({ file: req.file.buffer.toString('base64'), fileName: `IMG-${Date.now()}` })
            params.image = url.url
        } else {
            params.image = defaultImage
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

    static OAuthGoogle(token) {

        return new Promise((resolve, reject) => {
            axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
                headers: {
                    'Authorization': token
                }
            })
                .then(data => {
                    // console.log(data)
                    resolve(data)
                })
                .catch(err => {
                    reject(err)
                })
        })
    }

    static findOrRegister(result) {
        return new Promise((resolve, reject) => {
            this.findOne({ email: result.data.email })
                .then(data => {
                    if (!data) {
                        this.collection.insert({
                            fullname: result.data.name,
                            email: result.data.email,
                            image: result.data.picture,
                            language: process.env.language
                        })
                            .then(user => {
                                let newUser = user.ops[0]

                                let token = jwt.sign({ _id: newUser._id }, process.env.JWT_SIGNATURE_KEY)

                                return resolve({
                                    _id: newUser._id,
                                    fullname: newUser.fullname,
                                    image: newUser.image,
                                    email: newUser.email,
                                    token: token
                                })
                            })
                    } else {
                        let token = jwt.sign({ _id: data._id }, process.env.JWT_SIGNATURE_KEY)

                        return resolve({
                            _id: data._id,
                            fullname: data.fullname,
                            image: data.image,
                            email: data.email,
                            token: token
                        })
                    }
                })
                .catch(err => {
                    reject(err)
                })
        })
    }

    static myProgress(owner) {
        return new Promise((resolve, reject) => {

            // get current date
            var currentDate = new Date();
            let dateNow = currentDate.getDate();
            // console.log('DATE NOW: ',dateNow);

            // Find the user tasks
            Task.find({ owner: owner })
                .then(data => {
                    // console.log(data)
                    if (isEmpty(data)) return reject("Seem you haven't made any task yet, create it now")
                        let q = [[], [], [], [], []];
                        for (let z = 1; z <= 31; z++) {
                            if (q[0].length > 6) {
                                if (q[1].length > 6) {
                                    if (q[2].length > 6) {
                                        if (q[3].length > 6) {
                                            q[4].push(z);
                                        } else {
                                            q[3].push(z);
                                        }
                                    } else {
                                        q[2].push(z);
                                    }
                                } else {
                                    q[1].push(z);
                                }
                            } else {
                                q[0].push(z);
                            }
                        }
                        //===========GET THE INDEX OF WEEK===========
                        let indexOfWeek = 0;
                        for (let i = 0; i <= q.length - 1; i++) {
                            for (let j = 0; j <= q[i].length - 1; j++) {
                                if (dateNow === q[i][j]) {
                                    indexOfWeek = i;
                                }
                            }
                        }
        
                        let firstDateToCount = q[indexOfWeek][0];
                        let lastDateToCount = q[indexOfWeek][q[indexOfWeek].length - 1];
                        // ==============GET THE TOTAL OF SCORE IN A WEEK=================
                        let b = 0;
                        let x = 0;
        
                        for (let r = 0; r <= data.length - 1; r++) {
                            b = b + 1;
                            if (data[r].completion === true && data[r].createdAt.getDate() >= firstDateToCount && data[r].createdAt.getDate() <= lastDateToCount) {
                                x = x + 1;
                            }
                        }
        
                        let percentX = 100 / b;
                        let total = parseInt((percentX * x).toFixed(0));

                        var summary = {
                            index_of_week:indexOfWeek,
                            first_date_to_count: q[indexOfWeek][0],
                            last_date_to_count: q[indexOfWeek][q[indexOfWeek].length - 1],
                        }
                        // console.log(summary)
                        // console.log('Congratulation! you achieved', total, '% this week! keep spirit')

                    resolve({
                        progress: total,
                        date_now: dateNow,
                        message: `You achieved ${total}% this week! keep spirit`,
                        summary
                    })
                })
                .catch(err => {
                    reject(err)
                })
        })
    }


}

module.exports = User;