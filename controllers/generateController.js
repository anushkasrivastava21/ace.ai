const Material = require('../models/Material')
const Paper = require('../models/Paper')
const { retrieveRelevantChunks } = require('../agent/retriever')
const { buildGenerationPrompt } = require('../agent/prompts')
const { generate, parseJSONResponse } = require('../agent/llm')

const generatePaper = async (req, res) => {
    try {
        const { materialIds, difficulty, count, type, mode, typeCounts, paperStrategy } = req.body

        // Validate required fields
        if (!materialIds || !Array.isArray(materialIds) || materialIds.length === 0) {
            return res.status(400).json({ error: 'Select at least one material' })
        }
        if (!difficulty) {
            return res.status(400).json({ error: 'Difficulty is required' })
        }

        // Calculate total question count
        let totalCount
        if (mode === 'mixed' && typeCounts) {
            totalCount = (typeCounts.mcq || 0) + (typeCounts.short || 0) + (typeCounts.long || 0)
            if (totalCount === 0) {
                return res.status(400).json({ error: 'Set at least one question type count' })
            }
        } else {
            if (!count || !type) {
                return res.status(400).json({ error: 'Type and count are required for single mode' })
            }
            totalCount = count
        }

        // Fetch selected notes materials
        const notesMaterials = await Material.find({
            _id: { $in: materialIds },
            userId: req.userId,
            'chunks.0': { $exists: true },
            materialType: { $ne: 'previous_paper' }
        })

        if (notesMaterials.length === 0) {
            return res.status(400).json({ error: 'No processed study materials found for the selected items.' })
        }

        // Build search query from selected material filenames
        const query = notesMaterials.map(m => m.filename.replace('.pdf', '').replace(/_/g, ' ')).join(' ')

        // Scale topK with number of materials (more sources = more chunks needed)
        const topK = Math.min(notesMaterials.length * 4, 12)
        const relevantChunks = await retrieveRelevantChunks(query, notesMaterials, topK)

        // Handle PYQ strategy
        let pyqChunks = []
        const strategy = paperStrategy || 'material_only'

        if (strategy !== 'material_only') {
            const pyqMaterials = await Material.find({
                userId: req.userId,
                'chunks.0': { $exists: true },
                materialType: 'previous_paper'
            })

            if (pyqMaterials.length > 0) {
                pyqChunks = await retrieveRelevantChunks(query, pyqMaterials, 3)
            }
        }

        // Build config for prompt builder
        const promptConfig = {
            type: mode === 'mixed' ? 'mixed' : type,
            difficulty,
            count: totalCount,
            mode: mode || 'single',
            typeCounts: mode === 'mixed' ? typeCounts : undefined
        }

        const prompt = buildGenerationPrompt(relevantChunks, promptConfig, strategy, pyqChunks)

        const rawResponse = await generate(prompt)
        const questions = parseJSONResponse(rawResponse)

        const paper = new Paper({
            userId: req.userId,
            materialId: materialIds[0],
            config: {
                type: mode === 'mixed' ? 'mixed' : type,
                difficulty,
                count: totalCount,
                mode: mode || 'single',
                typeCounts: mode === 'mixed' ? typeCounts : undefined,
                materialIds
            },
            questions: questions.map(q => ({
                question: q.question,
                answer: q.answer,
                options: q.options || [],
                type: q.type || type,
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