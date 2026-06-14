const chunkText = (text, chunkSize = 500, overlap = 50) => {
    const words = text.split(/\s+/)  // split into words
    const chunks = []

    for (let i = 0; i < words.length; i += (chunkSize - overlap)) {
        const chunk = words.slice(i, i + chunkSize).join(' ')
        if (chunk.trim().length > 0) {
            chunks.push(chunk)
        }
    }

    return chunks
}

module.exports = { chunkText }