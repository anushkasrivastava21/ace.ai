const { pipeline } = require('@xenova/transformers')

let embedder = null

// Load the model once, reuse it for every embedding (loading takes time)
const getEmbedder = async () => {
    if (!embedder) {
        embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2')
    }
    return embedder
}

const generateEmbedding = async (text) => {
    const model = await getEmbedder()
    const output = await model(text, { pooling: 'mean', normalize: true })
    return Array.from(output.data)  // convert to a plain array of numbers
}

module.exports = { generateEmbedding }