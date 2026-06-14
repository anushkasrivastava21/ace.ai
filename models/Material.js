const mongoose = require('mongoose')

const chunkSchema = new mongoose.Schema({
    text: String,
    embedding: [Number]   // array of numbers representing the chunk's meaning
})

const materialSchema = new mongoose.Schema({
    filename: {
        type: String,
        required: true
    },
    originalText: {
        type: String,
        required: true
    },
    chunks: [chunkSchema],
    topics: {
        type: [String],
        default: []
    },
    uploadedAt: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model('Material', materialSchema)