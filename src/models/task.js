const mongoose = require('mongoose');
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
        enum: [1, 2, 3], // 1=Low, 2=Normal, 3=High, if FE can convert to String, delete this.
        default: 2
    },
    importance: {
        type: String,
        enum: ["Low", "Normal", "High"]
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

class Task extends mongoose.model('Task', taskSchema) {
    static newTask(params) {
        return new Promise((resolve, reject) => {
            this.create(params)
                .then(data => {
                    resolve(data)
                })
                .catch(err => {
                    reject(err)
                })
        })
    }

    static findTask(owner) {
        return new Promise((resolve, reject) => {
            this.find({ owner: owner })
                .then(data => {
                    resolve(data)
                })
        })
    }

    static updateTask(id, params) {
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

    static destroyTask(id) {
        return new Promise((resolve, reject) => {
            this.findByIdAndDelete(id)
            .then(data => {
                resolve(data)
            })
            .catch(err => {
                reject(err)
            })
        })
    }
}

module.exports = Task;