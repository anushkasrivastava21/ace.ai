const Material = require('../models/Material')
const { extractText } = require('../agent/pdfParser')
const { chunkText } = require('../agent/chunker')
const { generateEmbedding } = require('../agent/embedder')

// READ ALL — GET /api/materials
const getAllMaterials = async (req, res) => {
    try {
        // Exclude embeddings from the list view — they're huge and not needed for display
        const materials = await Material.find().select('-chunks.embedding')
        res.status(200).json({
            count: materials.length,
            materials
        })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

// CREATE — POST /api/materials/upload
const uploadMaterial = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' })
        }

        const originalText = await extractText(req.file.buffer)

        if (!originalText || originalText.trim().length === 0) {
            return res.status(400).json({ error: 'Could not extract text from PDF' })
        }

        const textChunks = chunkText(originalText)

        const chunks = []
        for (const chunk of textChunks) {
            const embedding = await generateEmbedding(chunk)
            chunks.push({ text: chunk, embedding })
        }

        const material = new Material({
            filename: req.file.originalname,
            originalText,
            chunks
        })
        await material.save()

        res.status(201).json({
            message: 'Material uploaded and processed!',
            material: {
                _id: material._id,
                filename: material.filename,
                originalText: material.originalText,
                chunkCount: chunks.length,
                uploadedAt: material.uploadedAt
            }
        })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

// DELETE — DELETE /api/materials/:id
const deleteMaterial = async (req, res) => {
    try {
        const material = await Material.findByIdAndDelete(req.params.id)

        if (!material) {
            return res.status(404).json({ error: 'Material not found' })
        }

        res.status(200).json({ message: 'Material deleted!' })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

module.exports = { getAllMaterials, uploadMaterial, deleteMaterial }