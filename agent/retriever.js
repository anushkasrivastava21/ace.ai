const { generateEmbedding } = require('./embedder')

// Cosine similarity between two embedding arrays
const cosineSimilarity = (vecA, vecB) => {
    let dotProduct = 0
    let normA = 0
    let normB = 0

    for (let i = 0; i < vecA.length; i++) {
        dotProduct += vecA[i] * vecB[i]
        normA += vecA[i] * vecA[i]
        normB += vecB[i] * vecB[i]
    }

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))
}

// Find the top-k most relevant chunks across given materials
const retrieveRelevantChunks = async (query, materials, topK = 5) => {
    const queryEmbedding = await generateEmbedding(query)

    // Flatten all chunks from all materials, keeping track of which material they came from
    const allChunks = []
    for (const material of materials) {
        for (const chunk of material.chunks) {
            allChunks.push({
                text: chunk.text,
                embedding: chunk.embedding,
                materialId: material._id,
                filename: material.filename
            })
        }
    }

    // Score every chunk by similarity to the query
    const scored = allChunks.map((chunk) => ({
        ...chunk,
        score: cosineSimilarity(queryEmbedding, chunk.embedding)
    }))

    // Sort by score, highest first, return top-k
    scored.sort((a, b) => b.score - a.score)
    return scored.slice(0, topK)
}

module.exports = { retrieveRelevantChunks, cosineSimilarity }