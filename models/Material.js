const mongoose = require('mongoose')

const materialSchema = new mongoose.Schema({
    filename: {
        type: String,
        required: true
    },
    originalText: {
        type: String,
        required: true
    },
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