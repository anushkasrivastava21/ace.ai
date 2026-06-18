const mongoose = require('mongoose')

const questionSchema = new mongoose.Schema({
    question: String,
    answer: String,
    options: [String],
    type: { type: String },
    sourceChunk: String
})

const paperSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    materialId: mongoose.Schema.Types.ObjectId,
    name: {
        type: String,
        default: ''
    },
    config: {
        type: { type: String },
        difficulty: String,
        count: Number,
        subject: String,
        mode: String,
        typeCounts: {
            mcq: Number,
            short: Number,
            long: Number
        },
        materialIds: [mongoose.Schema.Types.ObjectId],
        timerMinutes: {
            type: Number,
            default: 30
        }
    },
    questions: [questionSchema],
    generatedAt: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model('Paper', paperSchema)