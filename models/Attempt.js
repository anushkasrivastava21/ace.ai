const mongoose = require('mongoose')

const answerSchema = new mongoose.Schema({
    questionId: String,
    userAnswer: String,
    score: Number,
    feedback: String
})

const attemptSchema = new mongoose.Schema({
    paperId: mongoose.Schema.Types.ObjectId,
    answers: [answerSchema],
    totalScore: Number,
    maxScore: Number,
    completedAt: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model('Attempt', attemptSchema)