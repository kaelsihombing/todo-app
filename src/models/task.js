const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const Schema = mongoose.Schema;

const taskSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    dueDate: {
        type: Date,
        min: Date.now(),
        required: true,
    },
    importanceLevel: {
        type: Number,
        enum: [1, 2, 3], // 1=Low, 2=Normal, 3=High
        default: 2
    },
    completion: {
        type: Boolean,
        default: false,
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
},
    {
        versionKey: false,
        timestamps: true,
    }
);

taskSchema.plugin(mongoosePaginate)

class Task extends mongoose.model('Task', taskSchema) {
    static newTask(bodyParams, owner) {
        return new Promise((resolve, reject) => {
            let params = {
                title: bodyParams.title,
                dueDate: bodyParams.dueDate,
                importanceLevel: bodyParams.importanceLevel,
                owner: owner,
            }
            this.create(params)
                .then(data => {
                    resolve(data)
                })
                .catch(err => {
                    reject(err)
                })
        })
    }

    static findTask(owner, page) {
        return new Promise((resolve) => {
            let options = {
                page: page,
                limit: 10,
                collation: { locale: 'en' }
            };
            this.paginate({ owner: owner }, options)
                .then(data => {
                    resolve(data)
                })
        })
    }

    static findAllTask(owner) {
        return new Promise((resolve) => {
            this.find({ owner: owner })
                .then(data => {
                    resolve(data)
                })
        })
    }

    static sortTaskByParams(owner, bodyParams, page) {
        return new Promise((resolve, reject) => {
            let options = {
                page: page,
                limit: 10,
                sort: bodyParams.params,
                collation: { locale: 'en' }
            };
            this.paginate({ owner: owner }, options)
                .then(data => {
                    resolve(data)
                })
                .catch(err => {
                    reject(err)
                })
        })
    }

    static filterTaskByParams(owner, bodyParams, page) {
        return new Promise((resolve, reject) => {
            let options = {
                page: page,
                limit: 10,
                collation: { locale: 'en' }
            };
            let params = {
                owner: owner,
                importanceLevel: bodyParams.importanceLevel,
                completion: bodyParams.completion,
            }
            for (let prop in params) if (!params[prop]) delete params[prop];
            this.paginate(params, options)
                .then(data => {
                    resolve(data)
                })
                .catch(err => {
                    reject(err)
                })
        })
    }

    static updateTask(owner, id, bodyParams) {
        return new Promise((resolve, reject) => {
            let params = {
                title: bodyParams.title,
                dueDate: bodyParams.dueDate,
                importanceLevel: bodyParams.importanceLevel,
                completion: bodyParams.completion,
            }

            for (let prop in params) if (!params[prop]) delete params[prop];

            let isDateValid = (Date.parse(params.dueDate) >= Date.now())

            if (!isDateValid && bodyParams.dueDate) reject("Invalid due date, due date can't be earlier than today")
            
            this.findById(id)
                .then(data => {
                    if (data.owner != owner) return reject('Invalid credentials')

                    this.findByIdAndUpdate(id, params, { new: true })
                        .then(data => {
                            resolve(data)
                        })
                        .catch(err => {
                            reject(err)
                        })
                }).catch(() => {
                    reject('Invalid task id')
                })
        })
    }

    static destroyTask(id) {
        return new Promise((resolve, reject) => {
            this.findByIdAndDelete(id)
                .then(data => {
                    resolve(`Task ${data.title} successfully deleted!`)
                })
                .catch(err => {
                    reject(err)
                })
        })
    }
}

module.exports = Task;