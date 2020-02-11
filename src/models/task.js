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
    importance: {
        type: String,
        enum: ['High', 'Normal', 'Low'],
        default: 'Low'
    },
    completion: {
        type: Boolean,
        default: false,
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
},
    {
        versionKey: false,
        timestamps: true,
    }
);

const Task = mongoose.model('Task', taskSchema);
module.exports = Task;