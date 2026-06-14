const mongoose = require('mongoose')

const questionSchema = new mongoose.Schema({
    question: String,
    answer: String,
    options: [String],
    sourceChunk: String
})

const paperSchema = new mongoose.Schema({
    materialId: mongoose.Schema.Types.ObjectId,
    config: {
        type: { type: String },
        difficulty: String,
        count: Number,
        subject: String
    },
    questions: [questionSchema],
    generatedAt: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model('Paper', paperSchema)