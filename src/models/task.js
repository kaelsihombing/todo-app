const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const Schema = mongoose.Schema;


const now = new Date()
const currentDate = now.setHours(0,0,0,0)

const taskSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    dueDate: {
        type: Date,
        min: currentDate,
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
                completion: bodyParams.completion || false,
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

    static findTask(owner, page, pagination, importanceLevel, completion) {
        return new Promise((resolve, reject) => {
            let options = {
                page: page,
                limit: 10,
                pagination: JSON.parse(pagination),
                sort: '-createdAt',
                collation: { locale: 'en' }
            };

            let params = {
                owner: owner,
                importanceLevel: importanceLevel,
                completion: completion,
            }
            for (let prop in params) if (!params[prop]) delete params[prop];

            this.find(params)
                .then(data => {
                    let lastPage = Math.ceil(data.length / 10)
                    if (options.page > lastPage) return reject("Page does not exist")
                })

            this.paginate({ owner: owner }, options)
                .then(data => {
                    resolve(data)
                })
        })
    }

    static sortTaskByParamsAsc(owner, sort, page) {
        return new Promise((resolve, reject) => {
            let options = {
                page: page,
                limit: 10,
                sort: `${sort}`,
                collation: { locale: 'en' }
            };

            if (['title', 'createdAt', 'dueDate', 'importanceLevel', 'completion'].indexOf(options.sort) < 0) {
                return reject("Invalid sorting parameter!")
            }

            this.find({ owner: owner })
                .then(data => {
                    let lastPage = Math.ceil(data.length / 10)
                    if (options.page > lastPage) return reject("Page does not exist")
                })

            this.paginate({ owner: owner }, options)
                .then(data => {
                    resolve(data)
                })
        })
    }

    static sortTaskByParamsDesc(owner, sort, page) {
        return new Promise((resolve, reject) => {
            let options = {
                page: page,
                limit: 10,
                sort: `-${sort}`,
                collation: { locale: 'en' }
            };

            if (['-title', '-createdAt', '-dueDate', '-importanceLevel', '-completion'].indexOf(options.sort) < 0) {
                return reject("Invalid sorting parameter!")
            }

            this.find({ owner: owner })
                .then(data => {
                    let lastPage = Math.ceil(data.length / 10)
                    if (options.page > lastPage) return reject("Page does not exist")
                })

            this.paginate({ owner: owner }, options)
                .then(data => {
                    resolve(data)
                })
        })
    }

    static filterTaskByImportance(owner, value, page) {
        return new Promise((resolve, reject) => {
            let options = {
                page: page,
                limit: 10,
                collation: { locale: 'en' }
            };
            let params = {
                owner: owner,
                importanceLevel: value,
            }

            if (['1', '2', '3'].indexOf(params.importanceLevel) < 0) {
                return reject("Invalid importancelevel value parameter!")
            }

            this.find(params)
                .then(data => {
                    
                    let lastPage = Math.ceil(data.length / 10)
                    if (options.page > lastPage) return reject("Page does not exist")
                })

            this.paginate(params, options)
                .then(data => {
                    resolve(data)
                })
        })
    }

    static filterTaskByCompletion(owner, value, page) {
        return new Promise((resolve, reject) => {
            let options = {
                page: page,
                limit: 10,
                collation: { locale: 'en' }
            };
            let params = {
                owner: owner,
                completion: value,
            }

            if (['true', 'false'].indexOf(params.completion) < 0) {
                return reject("Invalid completion value parameter!")
            }

            this.find(params)
                .then(data => {
                   
                    let lastPage = Math.ceil(data.length / 10)
                    if (options.page > lastPage) return reject("Page does not exist")
                })

            this.paginate(params, options)
                .then(data => {
                    resolve(data)
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

            let isDateValid = (Date.parse(params.dueDate) >= currentDate)
            if (!isDateValid && bodyParams.dueDate) return reject("Invalid due date, due date can't be earlier than today")

            if (bodyParams.completion === true) params.completion = true
            if (bodyParams.completion === false) params.completion = false
            console.log(params);
            

            this.findById(id)
                .then(data => {
                    if (data.owner != owner) return reject('Invalid credentials')

                    this.findByIdAndUpdate(id, params, { new: true })
                        .then(data => {
                            resolve(data)
                        })
                })
                .catch((err) => {
                    reject(err)
                })
        })
    }

    static destroyTask(owner, id) {
        return new Promise((resolve, reject) => {

            this.findById(id)
                .then(data => {
                    if (data.owner != owner) return reject('Invalid credentials')

                    this.findByIdAndDelete(id)
                        .then(data => {
                            resolve(`Task ${data.title} successfully deleted!`)
                        })
                })
                .catch(err => {
                    reject(err)
                })

        })
    }
}

module.exports = Task;