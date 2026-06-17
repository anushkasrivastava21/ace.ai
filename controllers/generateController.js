const Material = require('../models/Material')
const Paper = require('../models/Paper')
const { retrieveRelevantChunks } = require('../agent/retriever')
const { buildGenerationPrompt } = require('../agent/prompts')
const { generate, parseJSONResponse } = require('../agent/llm')

const generatePaper = async (req, res) => {
    try {
        const { subject, difficulty, count, type, paperStrategy } = req.body

        if (!subject || !difficulty || !count || !type) {
            return res.status(400).json({ error: 'subject, difficulty, count and type are required' })
        }

        // Get notes materials with chunks
        const notesMaterials = await Material.find({
            'chunks.0': { $exists: true },
            materialType: { $ne: 'previous_paper' }
        })

        if (notesMaterials.length === 0) {
            return res.status(400).json({ error: 'No processed study materials found. Upload a PDF first.' })
        }

        // Retrieve relevant chunks from notes
        const relevantChunks = await retrieveRelevantChunks(subject, notesMaterials, 5)

        // If a PYQ strategy is active, fetch PYQ chunks too
        let pyqChunks = []
        const strategy = paperStrategy || 'material_only'

        if (strategy !== 'material_only') {
            const pyqMaterials = await Material.find({
                'chunks.0': { $exists: true },
                materialType: 'previous_paper'
            })

            if (pyqMaterials.length > 0) {
                pyqChunks = await retrieveRelevantChunks(subject, pyqMaterials, 3)
            }
        }

        // Build prompt with strategy and PYQ context
        const prompt = buildGenerationPrompt(relevantChunks, { type, difficulty, count }, strategy, pyqChunks)

        // Call Ollama
        const rawResponse = await generate(prompt)

        // Parse JSON response
        const questions = parseJSONResponse(rawResponse)

        // Save paper to MongoDB
        const paper = new Paper({
            materialId: relevantChunks[0]?.materialId,
            config: { type, difficulty, count, subject },
            questions: questions.map(q => ({
                question: q.question,
                answer: q.answer,
                options: q.options || [],
                sourceChunk: relevantChunks[0]?.text?.substring(0, 200) || ''
            }))
        })
        await paper.save()

        res.status(201).json({
            message: 'Paper generated!',
            paper
        })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

module.exports = { generatePaper }