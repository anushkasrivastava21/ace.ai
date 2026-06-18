const Material = require('../models/Material')
const { extractText } = require('../agent/pdfParser')
const { chunkText } = require('../agent/chunker')
const { generateEmbedding } = require('../agent/embedder')

const getAllMaterials = async (req, res) => {
    try {
        const materials = await Material.find({ userId: req.userId }).select('-chunks.embedding')
        res.status(200).json({
            count: materials.length,
            materials
        })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

const uploadMaterial = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' })
        }

        const { materialType } = req.body
        const validTypes = ['notes', 'previous_paper']
        const resolvedType = validTypes.includes(materialType) ? materialType : 'notes'

        let tags = []
        try {
            tags = JSON.parse(req.body.tags || '[]')
            if (!Array.isArray(tags)) tags = []
            tags = [...new Set(tags.map(t => t.trim().toLowerCase()).filter(t => t.length > 0))]
        } catch {
            tags = []
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
            userId: req.userId,
            filename: req.file.originalname,
            originalText,
            materialType: resolvedType,
            topics: tags,
            chunks
        })
        await material.save()

        res.status(201).json({
            message: 'Material uploaded and processed!',
            material: {
                _id: material._id,
                filename: material.filename,
                originalText: material.originalText,
                materialType: material.materialType,
                topics: material.topics,
                chunkCount: chunks.length,
                uploadedAt: material.uploadedAt
            }
        })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

const renameMaterial = async (req, res) => {
    try {
        const { filename } = req.body

        if (!filename || !filename.trim()) {
            return res.status(400).json({ error: 'Filename is required' })
        }

        const material = await Material.findOneAndUpdate(
            { _id: req.params.id, userId: req.userId },
            { filename: filename.trim() },
            { new: true }
        ).select('-chunks.embedding')

        if (!material) {
            return res.status(404).json({ error: 'Material not found' })
        }

        res.status(200).json({ message: 'Material renamed!', material })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

const deleteMaterial = async (req, res) => {
    try {
        const material = await Material.findOneAndDelete({ _id: req.params.id, userId: req.userId })

        if (!material) {
            return res.status(404).json({ error: 'Material not found' })
        }

        res.status(200).json({ message: 'Material deleted!' })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

module.exports = { getAllMaterials, uploadMaterial, renameMaterial, deleteMaterial }