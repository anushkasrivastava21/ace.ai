const mongoose = require('mongoose')
require('dotenv').config()
const Material = require('../models/Material')
const { retrieveRelevantChunks } = require('./retriever')

const test = async () => {
    await mongoose.connect(process.env.MONGO_URI)

    const materials = await Material.find()

    const results = await retrieveRelevantChunks('malware detection using machine learning', materials, 3)

    console.log('Top 3 relevant chunks:\n')
    results.forEach((chunk, i) => {
        console.log(`--- Chunk ${i + 1} (score: ${chunk.score.toFixed(4)}) ---`)
        console.log(`From: ${chunk.filename}`)
        console.log(chunk.text.substring(0, 200) + '...\n')
    })

    process.exit(0)
}

test()